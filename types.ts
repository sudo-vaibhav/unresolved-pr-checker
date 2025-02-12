export interface Root {
  repository: Repository;
}

export interface Repository {
  pullRequests: PullRequests;
}

export interface PullRequests {
  edges: Edge[];
}

export interface Edge {
  node: Node;
}

export interface Node {
  author: Author;
  url: string;
  reviewDecision: string;
  reviewThreads: ReviewThreads;
}

export interface Author {
  login: string;
}

export interface ReviewThreads {
  edges: Edge2[];
}

export interface Edge2 {
  node: Node2;
}

export interface Node2 {
  isResolved: boolean;
  isOutdated: boolean;
  isCollapsed: boolean;
  comments: Comments;
}

export interface Comments {
  totalCount: number;
  nodes: Node3[];
}

export interface Node3 {
  author: Author2;
  body: string;
  url: string;
  title: string;
}

export interface Author2 {
  login: string;
}
