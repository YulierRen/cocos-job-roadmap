import {_decorator, Component, Node} from 'cc';

export class LogMgr extends Component {
    public static Instance: LogMgr = null;

    protected onLoad(): void {
        if (LogMgr.Instance == null) {
            LogMgr.Instance = this;
        } else {
            this.destroy();
            return;
        }
    }
    Init() {}

    /**
     * 普通日志
     */
    public static Log(message: any, ...args: any[]): void {
        console.log(message, ...args);
    }

    /**
     * 警告日志
     */
    public static Warn(message: any, ...args: any[]): void {
        console.warn(message, ...args);
    }

    /**
     * 错误日志
     */
    public static Error(message: any, ...args: any[]): void {
        console.error(message, ...args);
    }

    /**
     * 调试日志
     */
    public static Debug(message: any, ...args: any[]): void {
        console.debug(message, ...args);
    }

    /**
     * 信息日志
     */
    public static Info(message: any, ...args: any[]): void {
        console.info(message, ...args);
    }

    /**
     * 清空控制台日志
     */
    public static Clear(): void {
        if (LogMgr.Instance) {
            console.clear();
        }
    }
}
