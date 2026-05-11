export type UserRole = "owner" | "member";

export type ProjectStatus = "active" | "archived";

export type AlbumVersionStatus =
  | "draft"
  | "shared"
  | "changes_requested"
  | "approved";

export type ApprovalDecision = "approved" | "changes_requested";

export type SubscriptionPlan = "free" | "starter" | "pro" | "studio";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete";

export type EmailEventType = "share_link" | "new_comment" | "approval";

export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

export type Studio = {
  id: string;
  ownerUserId: string;
  name: string;
  slug: string;
  logoUrl?: string;
  brandColor?: string;
  createdAt: string;
};

export type StudioMember = {
  id: string;
  studioId: string;
  userId: string;
  role: UserRole;
  createdAt: string;
};

export type Client = {
  id: string;
  studioId: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
};

export type Project = {
  id: string;
  studioId: string;
  clientId: string;
  title: string;
  status: ProjectStatus;
  createdAt: string;
  archivedAt?: string;
};

export type AlbumVersion = {
  id: string;
  projectId: string;
  versionNumber: number;
  status: AlbumVersionStatus;
  createdAt: string;
  approvedAt?: string;
};

export type Spread = {
  id: string;
  albumVersionId: string;
  storageKey: string;
  thumbnailKey?: string;
  sourceKey?: string;
  sourcePage?: number;
  filename: string;
  width?: number;
  height?: number;
  mimeType: string;
  sizeBytes: number;
  sortOrder: number;
  createdAt: string;
};

export type ShareLink = {
  id: string;
  projectId: string;
  albumVersionId: string;
  tokenHash: string;
  passwordHash?: string;
  expiresAt?: string;
  createdAt: string;
  lastViewedAt?: string;
};

export type Comment = {
  id: string;
  spreadId: string;
  albumVersionId: string;
  authorName: string;
  authorEmail: string;
  body: string;
  x?: number;
  y?: number;
  resolvedAt?: string;
  createdAt: string;
};

export type Approval = {
  id: string;
  albumVersionId: string;
  clientName: string;
  clientEmail: string;
  decision: ApprovalDecision;
  message?: string;
  ipHash?: string;
  createdAt: string;
};

export type Subscription = {
  id: string;
  studioId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodEnd?: string;
  createdAt: string;
};

export type EmailEvent = {
  id: string;
  studioId: string;
  projectId?: string;
  to: string;
  subject: string;
  type: EmailEventType;
  createdAt: string;
};

export type ProofAlbumData = {
  users: User[];
  studios: Studio[];
  studioMembers: StudioMember[];
  clients: Client[];
  projects: Project[];
  albumVersions: AlbumVersion[];
  spreads: Spread[];
  shareLinks: ShareLink[];
  comments: Comment[];
  approvals: Approval[];
  subscriptions: Subscription[];
  emailEvents: EmailEvent[];
};

export type ProjectSummary = Project & {
  client: Client;
  latestVersion?: AlbumVersion;
  spreadCount: number;
  openCommentCount: number;
  approval?: Approval;
};

export type ProjectDetail = Project & {
  client: Client;
  studio: Studio;
  versions: Array<
    AlbumVersion & {
      spreads: Array<Spread & { signedUrl: string; thumbnailUrl: string }>;
      comments: Array<Comment & { spread?: Spread }>;
      approvals: Approval[];
      shareLinks: ShareLink[];
    }
  >;
  subscription?: Subscription;
};

export type ProofSession = {
  studio: Studio;
  project: Project;
  client: Client;
  version: AlbumVersion;
  spreads: Array<Spread & { signedUrl: string; thumbnailUrl: string }>;
  comments: Comment[];
  shareLink: ShareLink;
};
