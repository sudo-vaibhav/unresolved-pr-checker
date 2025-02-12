// export function add(a: number, b: number): number {
//   return a + b;
// }

import { Octokit } from "octokit";
import { Root } from "./types.ts";
import { composePaginateRest } from "../../Library/Caches/deno/npm/registry.npmjs.org/@octokit/plugin-paginate-rest/11.4.0/dist-types/compose-paginate.d.ts";

const ORG_READ_TOKEN = Deno.env.get("ORG_READ_TOKEN");
// // Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  console.log(ORG_READ_TOKEN);

  const octokit = new Octokit({
    auth: ORG_READ_TOKEN,
  });

  const allUnresolved: {
    repository: string;
    // pr_number: number;
    // pr_title: string;
    body: string;
    pr_author: string | null;
    pr_url: string;
    last_commenter: string | null;
  }[] = [];
  const reposList = ["PrishaPolicy/nx-monorepo"];
  for (const repoFull of reposList) {
    const [owner, repo] = repoFull.split("/");
    if (!owner || !repo) {
      throw new Error(`Invalid repository name: ${repoFull}`);
    }

    // 1. List all open PRs
    // const { data: prs } = await octokit.rest.pulls.list({
    //   owner,
    //   repo,
    //   state: "open",
    //   per_page: 100,
    // });

    // 2. For each PR, list review comments and check "last commenter"
    // for (const pr of prs) {
    // const { data: comments } = await octokit.rest.pulls.list({
    //   owner,
    //   repo,
    //   pull_number: pr.number,
    //   per_page: 100,
    // });

    const resp: Root = await octokit.graphql({
      query: `query FetchReviewComments($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) {

      pullRequests(first: 30, states: OPEN) {
        
         edges {
        
        node {
          author { 
          	login
          }
          title
          url
          reviewDecision
          reviewThreads(first: 100) {
            edges {
              node {
                isResolved
                isOutdated
                isCollapsed
                comments(first: 100) {
                  totalCount
                  nodes {
                    author {
                      login
                    }
                    body
                    url
                  }
                }
              }
            }
          }
        }
      }
      }
    }
  }`,
      owner,
      repo,
    });
    Deno.writeTextFileSync("resp.json", JSON.stringify(resp, null, 2));
    const pullRequests = resp.repository.pullRequests;
    for (const pr of pullRequests.edges) {
      const conversationThreads = pr.node.reviewThreads.edges.flatMap(
        (edge) => edge.node
      );
      const unresolvedConversationThreads = conversationThreads.filter(
        (thread) => !thread.isResolved
      );
      const lastUnresolvedComment = unresolvedConversationThreads
        .at(-1)
        ?.comments.nodes.at(-1);
      const lastCommenter = lastUnresolvedComment?.author.login;
      const lastCommentBody = lastUnresolvedComment?.body;
      if (lastCommenter && lastCommenter !== pr.node.author.login) {
        allUnresolved.push({
          repository: `${owner}/${repo}`,
          pr_url: pr.node.url,
          pr_author: pr.node.author.login,
          body: lastCommentBody!,
          last_commenter: lastCommenter!,
        });
      }
    }
    // const conversationThreads = pullRequests.edges.flatMap(
    //   (edge) => {...edge.node.reviewThreads.edges, pr:
    // );
    // console.log(conversationThreads);
    // const threads: {
    //   isResolved: boolean;
    //   comments: {
    //     nodes: {
    //       author: {
    //         login: string;
    //       };
    //     }[];
    //   };
    // }[] = resp.repository.pullRequests.edges
    //   .flatMap((edge) => edge.node)
    //   .flatMap((x) => x.reviewThreads.edges)
    //   .map((x) => x.node);
    // // console.log(threads);
    // if (
    //   threads
    //     .filter((thread) => !thread.isResolved)
    //     .filter(
    //       (thread) =>
    //         thread.comments.nodes.at(-1)?.author.login !== pr.user?.login
    //     ).length > 0
    // ) {

    //   allUnresolved.push({
    //     repository: `${owner}/${repo}`,
    //     pr_number: pr.number,
    //     pr_title: pr.title,
    //     pr_author: pr.user?.login,
    //     pr_url: pr.html_url,
    //   });
    // }
  }
  // }

  console.log(allUnresolved);
}
