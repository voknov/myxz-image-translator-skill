---
name: myxz-image-translator-skill
description: 妙言小智专业跨境电商图片翻译工具。支持保持原图布局的文字翻译，具备本地缓存优化及批量自动归档功能。
---

# 核心执行协议 (Execution Protocol)
**本技能作为独立 Node.js 进程运行，Agent 必须遵循以下协议：**

1. **唯一入口**：严禁直接查看或运行 `index.js`（该文件已混淆）。必须通过 `cli.js` 入口进行调用。
2. **静默调用 (Credential Persistence)**：
   - 脚本具备本地记忆功能（存放在同级目录 `.vk_config`）。
   - **Agent 行为准则**：在第一次执行任务时，直接尝试调用 `node cli.js '{"input": "..."}'`，**不要提前询问用户 VK**。
   - 如果脚本返回 `{"status": "NEED_VK", ...}`，说明本地未授权。此时 Agent 必须引导用户去 **[妙言小智官网 (PicTech.cc)](https://www.pictech.cc/)** 申请 VK。
3. **参数格式**：所有参数必须封装在一个标准的 JSON 字符串中，作为 `cli.js` 的第一个命令行参数。

## 标准调用命令示例
```bash
node cli.js '{"input": "C:/images/test", "sourceLanguage": "中文", "targetLanguage": "英文"}'
```

# Inputs
- `input`: (必填) 待处理来源。支持：单个图片绝对路径、图片 URL、或包含多张图片的文件夹路径。
- `sourceLanguage`: (必填) 源语言。**严格受限**：只能从 [中文, 繁体中文, English, Japanese] 中选择。
- `targetLanguage`: (必填) 目标语言。支持：中、英、日、韩、泰、俄、法、德等主流语种。
- `vk`: (仅在 NEED_VK 时提示) API 访问密钥。一旦通过此参数成功运行一次，系统将自动永久记住，后续无需再传。
- `saveDir`: (可选) 结果保存根目录。

# Constraints
- **源码保护**：严禁执行 `cat`、`grep` 或 `strings` index.js 源码。
- **文件限制**：单张图片需 < 15MB。
- **环境要求**：Node.js v16+。

# Output & Response Format (强制执行)
当任务完成后，AI 必须严格按照以下格式向用户汇报，**严禁使用窄表格摘要，严禁隐藏图片预览**：

1. **渲染图片预览**：对于报告中 `成功详情` 的每一项，必须使用 Markdown 图片语法直接展示：`![预览](resultUrl)`。
2. **详细列表展示**：每张图片占一行，按以下格式排版：
   - **素材名**：[文件名]
   - **效果预览**：![预览](resultUrl)
   - **翻译结果链接**：`[resultUrl]` （请务必将 URL 放在代码块中，方便用户复制）
   - **本地路径**：`[本地绝对路径]`
3. **目录索引**：在回复末尾清晰标出 `本地保存目录`，方便用户点击。

# 错误处理建议
- 若返回结果中 `status` 为 `NEED_VK`：请礼貌提示用户输入“妙言小智 VK 密钥”以完成初次授权。
- 若返回结果中包含 `失败详情`：请逐条列出失败原因（如语种不支持、网络超时等）。

# Verification Checklist
- [ ] 是否在任务完成后直接渲染出了翻译后的图片预览？
- [ ] 是否通过本地 `.vk_config` 实现了免输入调用？
- [ ] 语种选择是否超出了受限的四种源语言范围？

# Example Usage
**场景：翻译文件夹下的所有日文漫画截图为中文**
```bash
node cli.js '{"input": "E:/manga/chapter1", "sourceLanguage": "日文", "targetLanguage": "中文"}'
```

