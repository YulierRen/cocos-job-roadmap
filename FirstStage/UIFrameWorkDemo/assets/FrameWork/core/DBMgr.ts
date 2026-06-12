import {Component, sys} from 'cc';

export class DBMgr extends Component {
    public static Instance: DBMgr = null;

    // 所有 key 都会自动加此前缀，避免和其他系统冲突
    private keyPrefix = 'game:';

    protected onLoad(): void {
        if (DBMgr.Instance == null) {
            DBMgr.Instance = this;
        } else {
            this.destroy();
            return;
        }
    }

    Init(prefix?: string) {
        if (prefix != null && prefix.trim().length > 0) {
            this.keyPrefix = prefix.trim();
        }
    }

    private makeKey(key: string): string {
        return this.keyPrefix + key;
    }

    // ===== 基础字符串 =====

    SetString(key: string, value: string): void {
        try {
            sys.localStorage.setItem(this.makeKey(key), value ?? '');
        } catch (e) {
            console.error('DBMgr SetString failed:', key, e);
        }
    }

    GetString(key: string, defaultValue = ''): string {
        try {
            const raw = sys.localStorage.getItem(this.makeKey(key));
            return raw == null ? defaultValue : raw;
        } catch (e) {
            console.error('DBMgr GetString failed:', key, e);
            return defaultValue;
        }
    }

    // ===== 数字 =====

    SetNumber(key: string, value: number): void {
        this.SetString(key, String(value));
    }

    GetNumber(key: string, defaultValue = 0): number {
        const v = Number(this.GetString(key, String(defaultValue)));
        return Number.isNaN(v) ? defaultValue : v;
    }

    // ===== 布尔 =====

    SetBool(key: string, value: boolean): void {
        this.SetString(key, value ? '1' : '0');
    }

    GetBool(key: string, defaultValue = false): boolean {
        const raw = this.GetString(key, defaultValue ? '1' : '0');
        return raw === '1' || raw.toLowerCase() === 'true';
    }

    // ===== JSON 对象 =====

    SetObject<T>(key: string, value: T): void {
        try {
            const json = JSON.stringify(value);
            this.SetString(key, json);
        } catch (e) {
            console.error('DBMgr SetObject failed:', key, e);
        }
    }

    GetObject<T>(key: string, defaultValue: T): T {
        const raw = this.GetString(key, '');
        if (raw.length === 0) {
            return defaultValue;
        }

        try {
            return JSON.parse(raw) as T;
        } catch (e) {
            console.error('DBMgr GetObject parse failed:', key, e);
            return defaultValue;
        }
    }

    // ===== 删除 / 检查 / 清理 =====

    Remove(key: string): void {
        try {
            sys.localStorage.removeItem(this.makeKey(key));
        } catch (e) {
            console.error('DBMgr Remove failed:', key, e);
        }
    }

    HasKey(key: string): boolean {
        try {
            return sys.localStorage.getItem(this.makeKey(key)) != null;
        } catch (e) {
            console.error('DBMgr HasKey failed:', key, e);
            return false;
        }
    }

    // 仅清理当前前缀下的数据
    ClearByPrefix(): void {
        try {
            const prefix = this.keyPrefix;
            const allKeys: string[] = [];

            for (let i = 0; i < sys.localStorage.length; i++) {
                const k = sys.localStorage.key(i);
                if (k != null && k.startsWith(prefix)) {
                    allKeys.push(k);
                }
            }

            allKeys.forEach((k) => sys.localStorage.removeItem(k));
        } catch (e) {
            console.error('DBMgr ClearByPrefix failed:', e);
        }
    }
}
