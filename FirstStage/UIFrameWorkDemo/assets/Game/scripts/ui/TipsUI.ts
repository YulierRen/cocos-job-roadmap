import { _decorator, Component, Label, Node, tween, Vec3, UIOpacity } from 'cc';
import { ObjectPool } from 'db://assets/FrameWork/core/ObjectPool';
import { UIOpenParams } from 'db://assets/FrameWork/core/Types';
import { UIRouter } from 'db://assets/FrameWork/core/UIRouter';



export class TipsUI extends Component {
        protected onLoad(): void {
            this.Init();
        }

        private params: UIOpenParams = null;

        private playTipsAnim() {
            let opacityComp = this.node.getComponent(UIOpacity);
            if (!opacityComp) {
                opacityComp = this.node.addComponent(UIOpacity);
            }

            const startPos = this.node.position.clone();
            const endPos = new Vec3(startPos.x, startPos.y + 80, startPos.z);

            tween(this.node)
                .parallel(
                    tween(this.node).to(1.2, { position: endPos }),
                    tween(this.node).to(1.2, {}, {
                        onUpdate: (_target, ratio) => {
                            opacityComp.opacity = Math.round(255 * (1 - ratio));
                        }
                    })
                )
                .call(() => {
                    this.node.setPosition(startPos);
                    ObjectPool.Instance.Put(this.node, this.params.uiName);
                })
                .start();
        }
    
        Init(udata?: UIOpenParams){
            if(!udata){
                return;
            }
            this.params = udata;
            this.node.getChildByPath("layout/label").getComponent(Label).string = udata.payload;
            this.playTipsAnim();
        }    
    
}


