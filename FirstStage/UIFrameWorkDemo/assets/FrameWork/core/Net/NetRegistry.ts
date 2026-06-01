import {_decorator, Component, Node} from 'cc';
import {NetMgr} from './NetMgr';
import {Client} from './Client';

export class NetRegistry extends Component {
    public static Instance: NetRegistry = null;

    protected onLoad() {
        if (NetRegistry.Instance === null) {
            NetRegistry.Instance = this;
        } else {
            this.destroy();
            return;
        }
    }

    Init() {
        this.registerNet('default');
    }

    registerNet(key: string) {
        const netKey = key;
        let client = NetMgr.Instance.getNet(netKey) as Client | undefined;
        if (!client) {
            client = this.node.addComponent(Client);
            NetMgr.Instance.registerNet(netKey, client);
            console.log('注册了Net');
        }
    }

    registerMessageHandler(netKey: string, cmd: string, handler: (msg: any) => void) {
        NetMgr.Instance.onMessage(netKey, cmd, handler);
    }
}
