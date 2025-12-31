const simpleGit = require("simple-git");
const path = require("path");

class GitManager {
  constructor(workingDir) {
    this.git = simpleGit(workingDir || process.cwd());
  }

  async getStatus() {
    try {
      const status = await this.git.status();
      return {
        modified: status.modified.length,
        created: status.created.length,
        deleted: status.deleted.length,
        ahead: status.ahead,
        files: status.files,
      };
    } catch (error) {
      console.error("Git status error:", error);
      throw error;
    }
  }

  async publish(message = "Update via Admin Panel") {
    try {
      // 1. 自动拉取以防冲突
      await this.git
        .pull("origin", "main", { "--rebase": "true" })
        .catch((err) => {
          console.warn(
            "Pull failed (might be no remote), continuing...",
            err.message,
          );
        });

      // 2. 添加所有变更
      await this.git.add(".");

      // 3. 提交
      await this.git.commit(message);

      // 4. 推送
      await this.git.push("origin", "main");

      return { success: true, message: "Published successfully" };
    } catch (error) {
      console.error("Git publish error:", error);
      throw error;
    }
  }

  async getLastCommit() {
    try {
      const log = await this.git.log({ n: 1 });
      return log.latest;
    } catch (error) {
      return null;
    }
  }
}

module.exports = new GitManager();
