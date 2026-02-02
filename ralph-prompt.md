Check PRs: 
Look for open Pull request. If you find open PRs make a critical code review. 
When the PR has conflicts resolve them first.
Check if the PRs has comments without reactions and implement them if it is a useful comment, otherwise mark it with 👎 when you did some changes resact with a 👍. Otherwise decide if it can be merged, if not add your remarks as comments in the PR if yes approve and merge the pr.

When there where no PRs or work on PRs then:

Find next isue:
Look at the open issue list and decide which of them has the highest priority. Consider the dependencies to other open issues. If there are any, pick the most important one.
When the issue text is short, refine the issue and add at least some acceptance criteria. Do this by editing/updating the text not with a comment. Use a comment if you have any questions about the requirement.
Ensure you are on the correct branch for this issue, check if the latest code from main is merged in the feature branch. 
Implement the issue. Always make sure that code is working by adding and running tests and run typechecking.
When you are done, then summarize all your changes into an commit message prefix the commit message with the issue number like "#1 implemented cool stuff" commit and push your changes. If there is no PR for this issue create one.

When there is no more open issue to work on output "<promise>COMPLETE</promise>"