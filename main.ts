// export function add(a: number, b: number): number {
//   return a + b;
// }

import { Octokit } from "octokit";
import process from "node:process";

// // Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  //   console.log("Add 2 + 3 =", add(2, 3));

  const octokit = new Octokit({
    auth: process.env.ORG_READ_TOKEN,
  });

  const allUnresolved = [];
  const reposList = ["PrishaPolicy/nx-monorepo"];
  for (const repoFull of reposList) {
    const [owner, repo] = repoFull.split("/");
    if (!owner || !repo) {
      throw new Error(`Invalid repository name: ${repoFull}`);
    }

    // 1. List all open PRs
    const { data: prs } = await octokit.rest.pulls.list({
      owner,
      repo,
      state: "open",
      per_page: 100,
    });

    // 2. For each PR, list review comments and check "last commenter"
    for (const pr of prs) {
      const { data: comments } = await octokit.rest.pulls.listReviewComments({
        owner,
        repo,
        pull_number: pr.number,
        per_page: 100,
      });

      if (comments.length > 0) {
        // Check the last comment
        const lastComment = comments[comments.length - 1];
        // console.log(lastComment);
        console.log(pr.user?.login, pr.title);
        // If the last comment is NOT from the PR author, we consider it "unresolved"
        // if (lastComment.user.login !== pr.user.login) {
        //   allUnresolved.push({
        //     repository: `${owner}/${repo}`,
        //     pr_number: pr.number,
        //     pr_title: pr.title,
        //     pr_author: pr.user.login,
        //     last_commenter: lastComment.user.login,
        //   });
        // }
      }
    }
  }
}
