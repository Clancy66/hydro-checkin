import { db, moment, Handler, PRIV, Context } from 'hydrooj';
import { HomeHandler } from 'hydrooj/src/handler/home';

const checkinCollection = db.collection('checkin');

interface CheckinDoc {
    uid: number,
    date: string,
    count: number,
    total: number,
    type: number,
    content: string[],
    checkinReward: number
}

declare module 'hydrooj' {
    interface Model {
        checkin: typeof CheckinModel;
    }
    interface Collections {
        checkin: CheckinDoc;
    }
}

class CheckinModel {
    static coll = checkinCollection;

    static async getByUid(uid: number) {
        return await CheckinModel.coll.findOne({ uid });
    }

    static async add(uid: number, date: string, count: number, total: number, type: number, content: string[], checkinReward: number) {
        const ddoc = await CheckinModel.coll.findOne({ uid });
        if (ddoc) {
            const result = await CheckinModel.coll.findOneAndUpdate(
                { uid },
                { $set: { date, count, total, type, content, checkinReward } }
            );
            return result;
        }
        else {
            const result = await CheckinModel.coll.insertOne({
                uid, 
                date,
                count,
                total,
                type,
                content,
                checkinReward
            });

            return result;    
        }
    }
}

global.Hydro.model.checkin = CheckinModel;

const PositiveContents = [
    '背诵模板.基础操作',
    '手推公式.加深理解',
    '阅读题解.学习思路',
    '重构代码.提升规范',
    '清理桌面.环境影响心情',
    '早睡早起.保持精力',
    '远离手机.专注力',
    '补充维 C.身体健康',
    '愣神发呆.大脑休息',
    '回顾错题.查漏补缺',
    '模拟测试.适应节奏',
    '练习盲打.提升手速',
    '整理文件.避免丢失',
    '给队友点赞.维护关系',
    '相信直觉.蒙题技巧',
    '暴力枚举.骗分手段',
    '特判边界.防止 RE/WA',
    '检查 long long.防爆 int',
    '多组数据清空.防坑',
    '输出换行.格式正确',
    '膜拜大佬.攒人品',
    '转发锦鲤.求好运',
    '换个壁纸.换心情',
    '听首纯音乐.助眠/专注',
    '喝杯奶茶.快乐源泉',
    '出去走走.透气',
    '吐槽出题人.解压',
    '相信 C++.语言信仰',
    '拒绝 Java.开玩笑的',
    '今天不刷题.彻底放松',
]

const NegativeContents = [
    '死磕难题.浪费时间',
    '盲目提交.增加罚时',
    '直接抄代码.无意义',
    '熬夜修仙.伤身且效率低',
    '暴饮暴食.犯困',
    '情绪崩溃.影响心态',
    '迷信玄学.不如写暴力',
    '轻视签到题.容易翻车',
    '忘记保存.血的教训',
    '使用全局变量.递归易错',
    '数组开小.RE 警告',
    '除以零.Runtime Error',
    '死循环.TLE 警告',
    '看榜做题.容易被带偏',
    '临阵磨枪.比赛还没结束就放弃',
    '频繁切换窗口.分心',
    '纠结题意.读不懂就猜',
    '忽视样例.样例是提示',
    '复制粘贴.可能带 Bug',
    '立 Flag.会被打脸',
    '膜拜大佬.会被嘲讽',
    '转发锦鲤.会变成摸鱼',
    '换个壁纸.熟悉的才是最好的',
    '听首纯音乐.容易打瞌睡',
    '喝杯奶茶.会长胖',
    '出去走走.会走丢',
    '吐槽出题人.会被针对',
    '相信 C++.PHP 是最好的',
    '拒绝 Java.Java 等于茶',
    '今天不刷题.会手生',
]

class CheckinHandler extends Handler {
    async get() {
        const uid = this.user._id;
        // 获取北京时间
        const today = moment().tz('Asia/Shanghai').format("YYYY-MM-DD");

        const type = Math.floor(Math.random() * 7);
        let cnt = 1;
        let total = 1;
        let content = [];
        const n = PositiveContents.length;
        for (let i = 0; i < 2; i++) {
            let str = PositiveContents[Math.floor(Math.random() * n)];
            while (content.includes(str)) {
                str = PositiveContents[Math.floor(Math.random() * n)];
            }

            content.push(str);
        }
        const m = NegativeContents.length;
        for (let i = 0; i < 2; i++) {
            let str = NegativeContents[Math.floor(Math.random() * m)];
            while (content.includes(str)) {
                str = NegativeContents[Math.floor(Math.random() * m)];
            }

            content.push(str);
        }

        const checkinReward = Math.ceil(Math.random() * 3);
        // 尝试掉落金币
        try {
            const coins = await db.collection('coins').findOne({uid});
            
            if (!coins) {
                await db.collection('coins').insertOne({
                    uid: uid,
                    total: checkinReward,
                    checkin: checkinReward,
                    stages: 0,
                    problems: 0,
                    bonus: 0
                })
            }
            else {
                await db.collection('coins').updateOne(
                    {uid: uid},
                    {
                        $inc: { total: checkinReward, checkin: checkinReward }
                })
            }

            await db.collection('bills').insertOne({
                createAt: new Date(),
                rootId: uid,
                uid: uid,
                goodsId: "",
                coins: checkinReward,
                content: "[打卡奖励] " + today,
                check: 2
            })
        }
        catch (error: any) { /* 忽略 */ }

        let doc = await CheckinModel.getByUid(uid);

        if (doc) {
            if (!moment(today).isSame(moment(doc.date), 'day')) {
                total = (doc.total || 0) + 1;

                // 计算连续签到天数
                if (moment(doc.date).add(1, 'day').isSame(moment(today), 'day')) {
                    cnt = (doc.count || 0) + 1;
                }
                await CheckinModel.add(uid, today, cnt, total, type, content, checkinReward);
            }
        }
        else {
            await CheckinModel.add(uid, today, cnt, total, type, content, checkinReward);
        }

        this.response.redirect = '/';
    }
}

// 首页获取当天日期、运势文字、颜色及签到数据
async function getCheckin(payload, handler) {
    payload.today = moment().tz('Asia/Shanghai').format("YYYY-MM-DD");

    // 将签到数据注入到 payload 中
    if (handler.user.hasPriv(PRIV.PRIV_USER_PROFILE)) {
        const uid = handler.user._id;
        const checkinDoc = await CheckinModel.getByUid(uid);
        payload.checkin = checkinDoc || null; // 如果没有签到记录，返回 null
        if (payload.checkin) {
            payload.checkin.date = moment(payload.checkin.date).format("YYYY-MM-DD");
        }
    }

    return payload;
}

// 将 handler 实例传递给 getCheckin，以便获取当前用户信息
HomeHandler.prototype.getCheckin = async function (domainId, payload) {
    // 注意：这里使用箭头函数或 bind 确保 this 指向当前的 HomeHandler 实例
    return await getCheckin(payload, this);
};

// 配置项及路由
export async function apply(ctx: Context) {
    // 简单的数据迁移逻辑（仅首次安装时运行，注意重启系统也会再次运行）
    const migrated = await db.collection('system').findOne({ _id: 'checkin_migrated' });
    if (!migrated) {
        const users = await db.collection('user').find({ checkin_time: { $exists: true } }).toArray();
        for (const user of users) {
            await checkinCollection.updateOne(
                { uid: user._id },
                { $set: {
                    date: user.checkin_time,
                    count: user.checkin_cnt_now, 
                    total: user.checkin_cnt_all,
                    type: user.checkin_luck
                }},
                { upsert: true }
            );
        }
        const currentLog = '[Checkin] 历史签到数据迁移完成！';
        await db.collection('system').insertOne({ _id: 'checkin_migrated', value: currentLog });
        console.log(currentLog);
    }

    ctx.Route('checkin', '/checkin', CheckinHandler, PRIV.PRIV_USER_PROFILE);
}