import path from "node:path";
import {
  createId,
  createShareToken,
  hashPassword,
  hashShareToken,
  nowIso,
  slugify,
  verifyPassword,
} from "@/server/security";
import {
  detectImageDimensions,
  ensureDemoAsset,
  estimatePdfPageCount,
  isPdfFile,
  pdfPagePlaceholderSvg,
  signedAssetUrl,
  validateUploadFile,
  writeStoredAsset,
} from "@/server/storage";
import { PLAN_LIMITS } from "@/server/billing";
import type {
  AlbumVersion,
  Approval,
  ApprovalDecision,
  Client,
  Comment,
  EmailEventType,
  Project,
  ProjectDetail,
  ProjectSummary,
  ProofAlbumData,
  ProofSession,
  ShareLink,
  Spread,
  Studio,
  SubscriptionPlan,
  User,
} from "@/server/types";

export const DEMO_USER_ID = "user_demo";
export const DEMO_STUDIO_ID = "studio_evergreen";
export const DEMO_SHARE_TOKEN = "demo-proof-token";

type ProofAlbumGlobal = typeof globalThis & {
  __proofAlbumMemoryData?: ProofAlbumData;
};

function shouldUseMemoryStore() {
  return process.env.PROOFALBUM_STORAGE === "memory";
}

async function fsPromises() {
  return import("node:fs/promises");
}

function dataFile() {
  const testOverride =
    process.env.NODE_ENV === "test"
      ? process.env.PROOFALBUM_DATA_DIR
      : undefined;

  return path.join(
    testOverride || path.join(process.cwd(), ".data"),
    "proofalbum-demo.json",
  );
}

async function ensureDataDir() {
  if (shouldUseMemoryStore()) {
    return;
  }

  const { mkdir } = await fsPromises();
  await mkdir(path.dirname(dataFile()), { recursive: true });
}

function createSeedData(): ProofAlbumData {
  const createdAt = "2026-05-11T12:00:00.000Z";

  const users: User[] = [
    {
      id: DEMO_USER_ID,
      email: "demo@proofalbum.test",
      name: "Avery Stone",
      createdAt,
    },
  ];

  const studios: Studio[] = [
    {
      id: DEMO_STUDIO_ID,
      ownerUserId: DEMO_USER_ID,
      name: "Evergreen & Gold Studio",
      slug: "evergreen-gold",
      brandColor: "#0f766e",
      logoUrl: "",
      createdAt,
    },
  ];

  const clients: Client[] = [
    {
      id: "client_harper",
      studioId: DEMO_STUDIO_ID,
      name: "Maya Harper",
      email: "maya.harper@example.com",
      phone: "+1 555 0184",
      createdAt,
    },
  ];

  const projects: Project[] = [
    {
      id: "project_harper_album",
      studioId: DEMO_STUDIO_ID,
      clientId: "client_harper",
      title: "Harper Wedding Album",
      status: "active",
      createdAt,
    },
  ];

  const albumVersions: AlbumVersion[] = [
    {
      id: "version_harper_v1",
      projectId: "project_harper_album",
      versionNumber: 1,
      status: "changes_requested",
      createdAt,
    },
  ];

  const spreads: Spread[] = [
    {
      id: "spread_cover",
      albumVersionId: "version_harper_v1",
      storageKey: "demo/harper/cover.svg",
      thumbnailKey: "demo/harper/cover.svg",
      filename: "01-cover.svg",
      width: 1400,
      height: 900,
      mimeType: "image/svg+xml",
      sizeBytes: 4200,
      sortOrder: 1,
      createdAt,
    },
    {
      id: "spread_ceremony",
      albumVersionId: "version_harper_v1",
      storageKey: "demo/harper/ceremony.svg",
      thumbnailKey: "demo/harper/ceremony.svg",
      filename: "02-ceremony.svg",
      width: 1400,
      height: 900,
      mimeType: "image/svg+xml",
      sizeBytes: 4200,
      sortOrder: 2,
      createdAt,
    },
    {
      id: "spread_portraits",
      albumVersionId: "version_harper_v1",
      storageKey: "demo/harper/portraits.svg",
      thumbnailKey: "demo/harper/portraits.svg",
      filename: "03-portraits.svg",
      width: 1400,
      height: 900,
      mimeType: "image/svg+xml",
      sizeBytes: 4200,
      sortOrder: 3,
      createdAt,
    },
    {
      id: "spread_reception",
      albumVersionId: "version_harper_v1",
      storageKey: "demo/harper/reception.svg",
      thumbnailKey: "demo/harper/reception.svg",
      filename: "04-reception.svg",
      width: 1400,
      height: 900,
      mimeType: "image/svg+xml",
      sizeBytes: 4200,
      sortOrder: 4,
      createdAt,
    },
  ];

  const comments: Comment[] = [
    {
      id: "comment_01",
      spreadId: "spread_ceremony",
      albumVersionId: "version_harper_v1",
      authorName: "Maya Harper",
      authorEmail: "maya.harper@example.com",
      body: "Can we swap this ceremony detail for the wider aisle photo?",
      x: 0.63,
      y: 0.42,
      createdAt: "2026-05-11T12:20:00.000Z",
    },
    {
      id: "comment_02",
      spreadId: "spread_reception",
      albumVersionId: "version_harper_v1",
      authorName: "Maya Harper",
      authorEmail: "maya.harper@example.com",
      body: "Approved. This reception spread feels perfect.",
      resolvedAt: "2026-05-11T13:04:00.000Z",
      createdAt: "2026-05-11T12:35:00.000Z",
    },
  ];

  const shareLinks: ShareLink[] = [
    {
      id: "share_demo",
      projectId: "project_harper_album",
      albumVersionId: "version_harper_v1",
      tokenHash: hashShareToken(DEMO_SHARE_TOKEN),
      createdAt,
      lastViewedAt: "2026-05-11T12:45:00.000Z",
    },
  ];

  return {
    users,
    studios,
    studioMembers: [
      {
        id: "member_demo_owner",
        studioId: DEMO_STUDIO_ID,
        userId: DEMO_USER_ID,
        role: "owner",
        createdAt,
      },
    ],
    clients,
    projects,
    albumVersions,
    spreads,
    shareLinks,
    comments,
    approvals: [],
    subscriptions: [
      {
        id: "sub_demo",
        studioId: DEMO_STUDIO_ID,
        plan: "starter",
        status: "trialing",
        currentPeriodEnd: "2026-06-10T12:00:00.000Z",
        createdAt,
      },
    ],
    emailEvents: [
      {
        id: "email_demo_share",
        studioId: DEMO_STUDIO_ID,
        projectId: "project_harper_album",
        to: "maya.harper@example.com",
        subject: "Your album proof is ready",
        type: "share_link",
        createdAt: "2026-05-11T12:10:00.000Z",
      },
    ],
  };
}

async function ensureDemoAssets() {
  await Promise.all([
    ensureDemoAsset("demo/harper/cover.svg", "Cover", "Harper Wedding"),
    ensureDemoAsset(
      "demo/harper/ceremony.svg",
      "Ceremony",
      "Pages 2-3",
      "#2563eb",
    ),
    ensureDemoAsset(
      "demo/harper/portraits.svg",
      "Portraits",
      "Pages 4-5",
      "#7c3aed",
    ),
    ensureDemoAsset(
      "demo/harper/reception.svg",
      "Reception",
      "Pages 6-7",
      "#dc2626",
    ),
  ]);
}

export async function resetDemoData() {
  const seed = createSeedData();

  if (shouldUseMemoryStore()) {
    (globalThis as ProofAlbumGlobal).__proofAlbumMemoryData = seed;
    await ensureDemoAssets();
    return seed;
  }

  const { writeFile } = await fsPromises();
  await ensureDataDir();
  await writeFile(dataFile(), JSON.stringify(seed, null, 2));
  await ensureDemoAssets();
  return seed;
}

export async function readData(): Promise<ProofAlbumData> {
  if (shouldUseMemoryStore()) {
    const store = globalThis as ProofAlbumGlobal;
    if (!store.__proofAlbumMemoryData) {
      return resetDemoData();
    }

    await ensureDemoAssets();
    return store.__proofAlbumMemoryData;
  }

  try {
    const { readFile } = await fsPromises();
    const raw = await readFile(dataFile(), "utf8");
    await ensureDemoAssets();
    return JSON.parse(raw) as ProofAlbumData;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") {
      throw error;
    }

    return resetDemoData();
  }
}

async function writeData(data: ProofAlbumData) {
  if (shouldUseMemoryStore()) {
    (globalThis as ProofAlbumGlobal).__proofAlbumMemoryData = data;
    return;
  }

  const { writeFile } = await fsPromises();
  await ensureDataDir();
  await writeFile(dataFile(), JSON.stringify(data, null, 2));
}

function getStudioIdForUser(data: ProofAlbumData, userId: string) {
  const membership = data.studioMembers.find(
    (member) => member.userId === userId,
  );
  if (!membership) {
    throw new Error("No studio found for user.");
  }

  return membership.studioId;
}

function assertProjectAccess(
  data: ProofAlbumData,
  userId: string,
  projectId: string,
) {
  const studioId = getStudioIdForUser(data, userId);
  const project = data.projects.find(
    (item) => item.id === projectId && item.studioId === studioId,
  );

  if (!project) {
    throw new Error("Project not found.");
  }

  return project;
}

function projectClient(data: ProofAlbumData, project: Project) {
  const client = data.clients.find((item) => item.id === project.clientId);
  if (!client) {
    throw new Error("Client not found.");
  }

  return client;
}

function projectStudio(data: ProofAlbumData, project: Project) {
  const studio = data.studios.find((item) => item.id === project.studioId);
  if (!studio) {
    throw new Error("Studio not found.");
  }

  return studio;
}

function canUseShareLink(
  shareLink: ShareLink,
  password?: string,
  accessGranted = false,
) {
  if (
    shareLink.expiresAt &&
    new Date(shareLink.expiresAt).getTime() < Date.now()
  ) {
    return false;
  }

  if (accessGranted) {
    return true;
  }

  return verifyPassword(password || "", shareLink.passwordHash);
}

function versionSpreads(data: ProofAlbumData, versionId: string) {
  return data.spreads
    .filter((spread) => spread.albumVersionId === versionId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((spread) => ({
      ...spread,
      signedUrl: signedAssetUrl(spread.storageKey),
      thumbnailUrl: signedAssetUrl(spread.thumbnailKey || spread.storageKey),
    }));
}

function summarizeProject(
  data: ProofAlbumData,
  project: Project,
): ProjectSummary {
  const versions = data.albumVersions
    .filter((version) => version.projectId === project.id)
    .sort((a, b) => b.versionNumber - a.versionNumber);
  const latestVersion = versions[0];
  const spreadIds = latestVersion
    ? data.spreads
        .filter((spread) => spread.albumVersionId === latestVersion.id)
        .map((spread) => spread.id)
    : [];
  const comments = data.comments.filter((comment) =>
    spreadIds.includes(comment.spreadId),
  );
  const approval = latestVersion
    ? data.approvals
        .filter((item) => item.albumVersionId === latestVersion.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
    : undefined;

  return {
    ...project,
    client: projectClient(data, project),
    latestVersion,
    spreadCount: spreadIds.length,
    openCommentCount: comments.filter((comment) => !comment.resolvedAt).length,
    approval,
  };
}

function planForStudio(data: ProofAlbumData, studioId: string) {
  return (
    data.subscriptions.find((item) => item.studioId === studioId)?.plan ||
    "free"
  );
}

function assertProjectLimit(data: ProofAlbumData, studioId: string) {
  const plan = planForStudio(data, studioId);
  const limit = PLAN_LIMITS[plan].activeProjects;

  if (limit === "unlimited") {
    return;
  }

  const activeCount = data.projects.filter(
    (project) => project.studioId === studioId && project.status === "active",
  ).length;

  if (activeCount >= limit) {
    throw new Error(
      `${PLAN_LIMITS[plan].label} plan allows ${limit} active album${
        limit === 1 ? "" : "s"
      }. Archive a project or upgrade before creating another.`,
    );
  }
}

function assertStorageLimit(
  data: ProofAlbumData,
  studioId: string,
  incomingBytes: number,
) {
  const plan = planForStudio(data, studioId);
  const limit = PLAN_LIMITS[plan].storageGb;

  if (limit === "unlimited") {
    return;
  }

  const projectIds = data.projects
    .filter((project) => project.studioId === studioId)
    .map((project) => project.id);
  const versionIds = data.albumVersions
    .filter((version) => projectIds.includes(version.projectId))
    .map((version) => version.id);
  const usedBytes = data.spreads
    .filter((spread) => versionIds.includes(spread.albumVersionId))
    .reduce((total, spread) => total + spread.sizeBytes, 0);
  const allowedBytes = limit * 1024 * 1024 * 1024;

  if (usedBytes + incomingBytes > allowedBytes) {
    throw new Error(
      `${PLAN_LIMITS[plan].label} plan includes ${limit} GB storage. Upgrade or remove older spreads before uploading more.`,
    );
  }
}

export async function getUser(userId: string) {
  const data = await readData();
  return data.users.find((user) => user.id === userId);
}

export async function getDashboardData(userId: string) {
  const data = await readData();
  const studioId = getStudioIdForUser(data, userId);
  const studio = data.studios.find((item) => item.id === studioId);

  if (!studio) {
    throw new Error("Studio not found.");
  }

  const projects = data.projects
    .filter((project) => project.studioId === studioId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((project) => summarizeProject(data, project));
  const subscription = data.subscriptions.find(
    (item) => item.studioId === studioId,
  );
  const activeProjects = projects.filter(
    (project) => project.status === "active",
  );
  const totalStorageBytes = data.spreads.reduce(
    (total, spread) => total + spread.sizeBytes,
    0,
  );

  return {
    studio,
    projects,
    subscription,
    emailEvents: data.emailEvents
      .filter((event) => event.studioId === studioId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5),
    metrics: {
      activeProjects: activeProjects.length,
      openComments: projects.reduce(
        (total, project) => total + project.openCommentCount,
        0,
      ),
      approvedVersions: data.albumVersions.filter(
        (version) =>
          version.status === "approved" &&
          data.projects.some(
            (project) =>
              project.id === version.projectId && project.studioId === studioId,
          ),
      ).length,
      totalStorageBytes,
    },
  };
}

export async function getProjectDetail(
  userId: string,
  projectId: string,
): Promise<ProjectDetail> {
  const data = await readData();
  const project = assertProjectAccess(data, userId, projectId);
  const versions = data.albumVersions
    .filter((version) => version.projectId === project.id)
    .sort((a, b) => b.versionNumber - a.versionNumber)
    .map((version) => ({
      ...version,
      spreads: versionSpreads(data, version.id),
      comments: data.comments
        .filter((comment) => comment.albumVersionId === version.id)
        .map((comment) => ({
          ...comment,
          spread: data.spreads.find((spread) => spread.id === comment.spreadId),
        }))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      approvals: data.approvals
        .filter((approval) => approval.albumVersionId === version.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      shareLinks: data.shareLinks
        .filter((link) => link.albumVersionId === version.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    }));

  return {
    ...project,
    client: projectClient(data, project),
    studio: projectStudio(data, project),
    versions,
    subscription: data.subscriptions.find(
      (item) => item.studioId === project.studioId,
    ),
  };
}

export async function updateStudio(
  userId: string,
  input: { name: string; logoUrl?: string; brandColor?: string },
) {
  const data = await readData();
  const studioId = getStudioIdForUser(data, userId);
  const studio = data.studios.find((item) => item.id === studioId);

  if (!studio) {
    throw new Error("Studio not found.");
  }

  studio.name = input.name;
  studio.slug = slugify(input.name);
  studio.logoUrl = input.logoUrl || "";
  studio.brandColor = input.brandColor || "#0f766e";

  await writeData(data);
  return studio;
}

export async function createProject(
  userId: string,
  input: {
    title: string;
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
  },
) {
  const data = await readData();
  const studioId = getStudioIdForUser(data, userId);
  assertProjectLimit(data, studioId);
  const createdAt = nowIso();
  let client = data.clients.find(
    (item) =>
      item.studioId === studioId &&
      item.email.toLowerCase() === input.clientEmail.toLowerCase(),
  );

  if (!client) {
    client = {
      id: createId("client"),
      studioId,
      name: input.clientName,
      email: input.clientEmail,
      phone: input.clientPhone || "",
      createdAt,
    };
    data.clients.push(client);
  } else {
    client.name = input.clientName;
    client.phone = input.clientPhone || client.phone;
  }

  const project: Project = {
    id: createId("project"),
    studioId,
    clientId: client.id,
    title: input.title,
    status: "active",
    createdAt,
  };

  const version: AlbumVersion = {
    id: createId("version"),
    projectId: project.id,
    versionNumber: 1,
    status: "draft",
    createdAt,
  };

  data.projects.push(project);
  data.albumVersions.push(version);
  await writeData(data);

  return { project, version };
}

export async function archiveProject(userId: string, projectId: string) {
  const data = await readData();
  const project = assertProjectAccess(data, userId, projectId);
  project.status = "archived";
  project.archivedAt = nowIso();
  await writeData(data);
  return project;
}

export async function createAlbumVersion(userId: string, projectId: string) {
  const data = await readData();
  const project = assertProjectAccess(data, userId, projectId);
  const existing = data.albumVersions.filter(
    (version) => version.projectId === project.id,
  );
  const version: AlbumVersion = {
    id: createId("version"),
    projectId,
    versionNumber:
      Math.max(0, ...existing.map((item) => item.versionNumber)) + 1,
    status: "draft",
    createdAt: nowIso(),
  };

  data.albumVersions.push(version);
  await writeData(data);
  return version;
}

export async function uploadSpreads(
  userId: string,
  input: { projectId: string; albumVersionId: string; files: File[] },
) {
  const data = await readData();
  const project = assertProjectAccess(data, userId, input.projectId);
  const version = data.albumVersions.find(
    (item) => item.id === input.albumVersionId && item.projectId === project.id,
  );

  if (!version) {
    throw new Error("Album version not found.");
  }

  if (input.files.length === 0) {
    throw new Error("Choose at least one JPG, PNG, or PDF file.");
  }

  assertStorageLimit(
    data,
    project.studioId,
    input.files.reduce((total, file) => total + file.size, 0),
  );

  const existingSortOrder = data.spreads
    .filter((spread) => spread.albumVersionId === version.id)
    .map((spread) => spread.sortOrder);
  let nextSortOrder = Math.max(0, ...existingSortOrder) + 1;
  const created: Spread[] = [];

  for (const file of input.files) {
    validateUploadFile(file);
    const extension = path.extname(file.name).toLowerCase();
    const bytes = Buffer.from(await file.arrayBuffer());

    if (isPdfFile(file)) {
      const pdfId = createId("pdf");
      const sourceKey = `${project.studioId}/${project.id}/${version.id}/${pdfId}.pdf`;
      const pageCount = estimatePdfPageCount(bytes);

      await writeStoredAsset(sourceKey, bytes);

      for (let page = 1; page <= pageCount; page += 1) {
        const id = createId("spread");
        const storageKey = `${project.studioId}/${project.id}/${version.id}/${id}-pdf-page-${page}.svg`;

        await writeStoredAsset(
          storageKey,
          Buffer.from(
            pdfPagePlaceholderSvg({
              filename: file.name,
              page,
              pageCount,
            }),
          ),
        );

        const spread: Spread = {
          id,
          albumVersionId: version.id,
          storageKey,
          thumbnailKey: storageKey,
          sourceKey,
          sourcePage: page,
          filename: `${file.name} · page ${page}`,
          width: 1400,
          height: 900,
          mimeType: "application/pdf",
          sizeBytes: Math.ceil(file.size / pageCount),
          sortOrder: nextSortOrder,
          createdAt: nowIso(),
        };

        nextSortOrder += 1;
        created.push(spread);
        data.spreads.push(spread);
      }

      continue;
    }

    const id = createId("spread");
    const storageKey = `${project.studioId}/${project.id}/${version.id}/${id}${extension}`;
    const dimensions = detectImageDimensions(bytes, file.type);

    await writeStoredAsset(storageKey, bytes);

    const spread: Spread = {
      id,
      albumVersionId: version.id,
      storageKey,
      thumbnailKey: storageKey,
      filename: file.name,
      width: dimensions.width,
      height: dimensions.height,
      mimeType: file.type,
      sizeBytes: file.size,
      sortOrder: nextSortOrder,
      createdAt: nowIso(),
    };

    nextSortOrder += 1;
    created.push(spread);
    data.spreads.push(spread);
  }

  await writeData(data);
  return created;
}

export async function reorderSpread(
  userId: string,
  input: {
    projectId: string;
    albumVersionId: string;
    spreadId: string;
    direction: "up" | "down";
  },
) {
  const data = await readData();
  const project = assertProjectAccess(data, userId, input.projectId);
  const version = data.albumVersions.find(
    (item) => item.id === input.albumVersionId && item.projectId === project.id,
  );

  if (!version) {
    throw new Error("Album version not found.");
  }

  const spreads = data.spreads
    .filter((spread) => spread.albumVersionId === version.id)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const index = spreads.findIndex((spread) => spread.id === input.spreadId);
  const targetIndex = input.direction === "up" ? index - 1 : index + 1;

  if (index < 0 || targetIndex < 0 || targetIndex >= spreads.length) {
    return spreads;
  }

  const current = spreads[index];
  const target = spreads[targetIndex];
  const currentOrder = current.sortOrder;
  current.sortOrder = target.sortOrder;
  target.sortOrder = currentOrder;

  await writeData(data);
  return spreads;
}

export async function deleteSpread(
  userId: string,
  input: { projectId: string; albumVersionId: string; spreadId: string },
) {
  const data = await readData();
  const project = assertProjectAccess(data, userId, input.projectId);
  const version = data.albumVersions.find(
    (item) => item.id === input.albumVersionId && item.projectId === project.id,
  );

  if (!version) {
    throw new Error("Album version not found.");
  }

  data.spreads = data.spreads.filter(
    (spread) =>
      !(
        spread.id === input.spreadId &&
        spread.albumVersionId === input.albumVersionId
      ),
  );
  data.comments = data.comments.filter(
    (comment) => comment.spreadId !== input.spreadId,
  );

  const remaining = data.spreads
    .filter((spread) => spread.albumVersionId === version.id)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  remaining.forEach((spread, index) => {
    spread.sortOrder = index + 1;
  });

  await writeData(data);
}

export async function replaceSpread(
  userId: string,
  input: {
    projectId: string;
    albumVersionId: string;
    spreadId: string;
    file: File;
  },
) {
  const data = await readData();
  const project = assertProjectAccess(data, userId, input.projectId);
  const version = data.albumVersions.find(
    (item) => item.id === input.albumVersionId && item.projectId === project.id,
  );
  const spread = data.spreads.find(
    (item) => item.id === input.spreadId && item.albumVersionId === version?.id,
  );

  if (!version || !spread) {
    throw new Error("Spread not found.");
  }

  validateUploadFile(input.file);
  if (isPdfFile(input.file)) {
    throw new Error(
      "Use PDF import to add PDF pages; replace accepts JPG or PNG.",
    );
  }

  assertStorageLimit(data, project.studioId, input.file.size);

  const bytes = Buffer.from(await input.file.arrayBuffer());
  const extension = path.extname(input.file.name).toLowerCase();
  const storageKey = `${project.studioId}/${project.id}/${version.id}/${spread.id}-replacement${extension}`;
  const dimensions = detectImageDimensions(bytes, input.file.type);

  await writeStoredAsset(storageKey, bytes);

  spread.storageKey = storageKey;
  spread.thumbnailKey = storageKey;
  spread.sourceKey = undefined;
  spread.sourcePage = undefined;
  spread.filename = input.file.name;
  spread.mimeType = input.file.type;
  spread.sizeBytes = input.file.size;
  spread.width = dimensions.width;
  spread.height = dimensions.height;

  await writeData(data);
  return spread;
}

export async function createShareLink(
  userId: string,
  input: {
    projectId: string;
    albumVersionId: string;
    password?: string;
    expiresAt?: string;
  },
) {
  const data = await readData();
  const project = assertProjectAccess(data, userId, input.projectId);
  const version = data.albumVersions.find(
    (item) => item.id === input.albumVersionId && item.projectId === project.id,
  );

  if (!version) {
    throw new Error("Album version not found.");
  }

  const token = createShareToken();
  const link: ShareLink = {
    id: createId("share"),
    projectId: project.id,
    albumVersionId: version.id,
    tokenHash: hashShareToken(token),
    passwordHash: input.password ? hashPassword(input.password) : undefined,
    expiresAt: input.expiresAt || undefined,
    createdAt: nowIso(),
  };

  version.status = "shared";
  data.shareLinks.push(link);
  await writeData(data);

  return { link, token };
}

export async function recordEmailEvent(input: {
  studioId: string;
  projectId?: string;
  to: string;
  subject: string;
  type: EmailEventType;
}) {
  const data = await readData();
  data.emailEvents.push({
    id: createId("email"),
    createdAt: nowIso(),
    ...input,
  });
  await writeData(data);
}

export async function getProofByToken(
  token: string,
  password?: string,
  accessGranted = false,
): Promise<ProofSession | null> {
  const data = await readData();
  const tokenHash = hashShareToken(token);
  const shareLink = data.shareLinks.find(
    (link) => link.tokenHash === tokenHash,
  );

  if (!shareLink || !canUseShareLink(shareLink, password, accessGranted)) {
    return null;
  }

  const project = data.projects.find((item) => item.id === shareLink.projectId);
  const version = data.albumVersions.find(
    (item) =>
      item.id === shareLink.albumVersionId &&
      item.projectId === shareLink.projectId,
  );

  if (!project || !version) {
    return null;
  }

  shareLink.lastViewedAt = nowIso();
  await writeData(data);

  return {
    studio: projectStudio(data, project),
    project,
    client: projectClient(data, project),
    version,
    spreads: versionSpreads(data, version.id),
    comments: data.comments
      .filter((comment) => comment.albumVersionId === version.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    shareLink,
  };
}

export async function addCommentByToken(input: {
  token: string;
  password?: string;
  accessGranted?: boolean;
  spreadId: string;
  authorName: string;
  authorEmail: string;
  body: string;
  x?: number;
  y?: number;
}) {
  const data = await readData();
  const tokenHash = hashShareToken(input.token);
  const shareLink = data.shareLinks.find(
    (link) => link.tokenHash === tokenHash,
  );

  if (
    !shareLink ||
    !canUseShareLink(shareLink, input.password, input.accessGranted)
  ) {
    throw new Error("Proofing link not found.");
  }

  const spread = data.spreads.find(
    (item) =>
      item.id === input.spreadId &&
      item.albumVersionId === shareLink.albumVersionId,
  );

  if (!spread) {
    throw new Error("Spread is not part of this proofing link.");
  }

  const project = data.projects.find((item) => item.id === shareLink.projectId);
  if (!project) {
    throw new Error("Project not found.");
  }

  const studio = projectStudio(data, project);
  const owner = data.users.find((user) => user.id === studio.ownerUserId);
  const comment: Comment = {
    id: createId("comment"),
    spreadId: spread.id,
    albumVersionId: shareLink.albumVersionId,
    authorName: input.authorName,
    authorEmail: input.authorEmail,
    body: input.body,
    x: input.x,
    y: input.y,
    createdAt: nowIso(),
  };

  data.comments.push(comment);
  data.emailEvents.push({
    id: createId("email"),
    studioId: studio.id,
    projectId: project.id,
    to: owner?.email || "studio@example.com",
    subject: `New comment on ${project.title}`,
    type: "new_comment",
    createdAt: nowIso(),
  });

  await writeData(data);
  return comment;
}

export async function submitDecisionByToken(input: {
  token: string;
  password?: string;
  accessGranted?: boolean;
  clientName: string;
  clientEmail: string;
  decision: ApprovalDecision;
  message?: string;
  ipHash?: string;
}) {
  const data = await readData();
  const shareLink = data.shareLinks.find(
    (link) => link.tokenHash === hashShareToken(input.token),
  );

  if (
    !shareLink ||
    !canUseShareLink(shareLink, input.password, input.accessGranted)
  ) {
    throw new Error("Proofing link not found.");
  }

  const project = data.projects.find((item) => item.id === shareLink.projectId);
  const version = data.albumVersions.find(
    (item) => item.id === shareLink.albumVersionId,
  );

  if (!project || !version) {
    throw new Error("Proofing record not found.");
  }

  const approval: Approval = {
    id: createId("approval"),
    albumVersionId: version.id,
    clientName: input.clientName,
    clientEmail: input.clientEmail,
    decision: input.decision,
    message: input.message || "",
    ipHash: input.ipHash,
    createdAt: nowIso(),
  };

  version.status =
    input.decision === "approved" ? "approved" : "changes_requested";
  version.approvedAt =
    input.decision === "approved" ? approval.createdAt : undefined;
  data.approvals.push(approval);

  const studio = projectStudio(data, project);
  const owner = data.users.find((user) => user.id === studio.ownerUserId);
  data.emailEvents.push({
    id: createId("email"),
    studioId: studio.id,
    projectId: project.id,
    to: owner?.email || "studio@example.com",
    subject:
      input.decision === "approved"
        ? `${project.title} was approved`
        : `${project.title} needs changes`,
    type: "approval",
    createdAt: nowIso(),
  });

  await writeData(data);
  return approval;
}

export async function resolveComment(
  userId: string,
  projectId: string,
  commentId: string,
) {
  const data = await readData();
  const project = assertProjectAccess(data, userId, projectId);
  const projectVersionIds = data.albumVersions
    .filter((version) => version.projectId === project.id)
    .map((version) => version.id);
  const comment = data.comments.find(
    (item) =>
      item.id === commentId && projectVersionIds.includes(item.albumVersionId),
  );

  if (!comment) {
    throw new Error("Comment not found.");
  }

  comment.resolvedAt = nowIso();
  await writeData(data);
  return comment;
}

export async function exportProjectCommentsCsv(
  userId: string,
  projectId: string,
) {
  const data = await readData();
  const project = assertProjectAccess(data, userId, projectId);
  const versions = data.albumVersions.filter(
    (version) => version.projectId === project.id,
  );
  const versionIds = versions.map((version) => version.id);
  const rows = data.comments
    .filter((comment) => versionIds.includes(comment.albumVersionId))
    .map((comment) => {
      const version = versions.find(
        (item) => item.id === comment.albumVersionId,
      );
      const spread = data.spreads.find((item) => item.id === comment.spreadId);
      return [
        version?.versionNumber || "",
        spread?.filename || "",
        comment.authorName,
        comment.authorEmail,
        comment.body,
        comment.resolvedAt ? "resolved" : "open",
        comment.createdAt,
      ];
    });

  const escape = (value: unknown) =>
    `"${String(value).replaceAll('"', '""').replaceAll("\n", " ")}"`;

  return [
    [
      "version",
      "spread",
      "author_name",
      "author_email",
      "body",
      "status",
      "created_at",
    ],
    ...rows,
  ]
    .map((row) => row.map(escape).join(","))
    .join("\n");
}

export async function setSubscriptionPlan(
  userId: string,
  plan: SubscriptionPlan,
  stripeCustomerId?: string,
) {
  const data = await readData();
  const studioId = getStudioIdForUser(data, userId);
  const subscription = data.subscriptions.find(
    (item) => item.studioId === studioId,
  );

  if (subscription) {
    subscription.plan = plan;
    subscription.status = "active";
    subscription.stripeCustomerId =
      stripeCustomerId || subscription.stripeCustomerId;
  } else {
    data.subscriptions.push({
      id: createId("sub"),
      studioId,
      plan,
      status: "active",
      stripeCustomerId,
      createdAt: nowIso(),
    });
  }

  await writeData(data);
  return subscription;
}

export async function setSubscriptionPlanForStudio(input: {
  studioId: string;
  plan: SubscriptionPlan;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  status?: "trialing" | "active" | "past_due" | "canceled" | "incomplete";
  currentPeriodEnd?: string;
}) {
  const data = await readData();
  const subscription = data.subscriptions.find(
    (item) => item.studioId === input.studioId,
  );

  if (subscription) {
    subscription.plan = input.plan;
    subscription.status = input.status || "active";
    subscription.stripeCustomerId =
      input.stripeCustomerId || subscription.stripeCustomerId;
    subscription.stripeSubscriptionId =
      input.stripeSubscriptionId || subscription.stripeSubscriptionId;
    subscription.currentPeriodEnd =
      input.currentPeriodEnd || subscription.currentPeriodEnd;
  } else {
    data.subscriptions.push({
      id: createId("sub"),
      studioId: input.studioId,
      plan: input.plan,
      status: input.status || "active",
      stripeCustomerId: input.stripeCustomerId,
      stripeSubscriptionId: input.stripeSubscriptionId,
      currentPeriodEnd: input.currentPeriodEnd,
      createdAt: nowIso(),
    });
  }

  await writeData(data);
}
