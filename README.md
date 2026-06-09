# Hydro 签到插件

兼容 V5.0.1 社区版，不依赖任何插件和第三方库，安装方法见官方文档。

整体样式仿照洛谷打卡样式，在主运势下方随机产生两个宜事项和忌事项，以气泡形式出现详细解释。这里的事项是写在 `index.ts` 文件中的，不支持在线配置。允许的配置项是主运势的描述，以及主运势配色，由于在 `index.ts` 中写了随机 $0\sim 6$ 的主运势，因此务必配置 7 项。

## 配置方法

```bash
# 在系统设置中 hydrooj.homepage 中适当的位置添加配置，示例如下
- width: 4          # 配置在右侧边栏，默认宽度为 3，建议调整为 4 会比较美观
  checkin:
    type:           # 配置主运势描述和配色
      - text: "AK IOI"
        color: "#ED5A65"
      - text: "AK APIO"
        color: "#ED5A65"
      - text: "AK NOI"
        color: "#ED5A65"
      - text: "AK NOIP"
        color: "#161823"
      - text: "AK CSP-S"
        color: "#161823"
      - text: "AK CSP-J"
        color: "#161823"
      - text: "登顶 GESP"
        color: "#161823"
```

`/img` 中是 `README.md` 的截图，安装时可以放心删除。

## 部分截图

![image1.png](./img/image1.png)

![image2.png](./img/image2.png)