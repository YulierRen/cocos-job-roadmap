import {_decorator, AssetManager, assetManager, Component, Node} from 'cc';

export class ResMgr extends Component {
    public static Instance: ResMgr = null;

    private resMap: any = {};

    protected onLoad(): void {
        if (ResMgr.Instance == null) {
            ResMgr.Instance = this;
        } else {
            this.destroy();
        }
    }

    Init() {
        this.resMap = {};
    }

    async GetAsset(bundleName: string, assetName: string, assetType: any) {
        var bundle = (await this.LoadBundle(bundleName)) as unknown as AssetManager.Bundle;

        if (bundle == null) {
            console.log('bundle is null');
            return null;
        }

        var assetData = await this.GetAssetFromBundle(bundle, assetName, assetType);
        if (assetData == null) {
            console.log('assetData is null');
            return null;
        }
        return assetData;
    }

    async GetAssetFromBundle(bundle: AssetManager.Bundle, assetName: string, assetType: any) {
        return new Promise((resolve, reject) => {
            bundle.load(assetName, assetType, (err, assetData) => {
                if (err) {
                    reject(err);
                    return;
                } else {
                    resolve(assetData);
                }
            });
        });
    }

    async LoadBundle(bundleName: string) {
        return new Promise((resolve, reject) => {
            assetManager.loadBundle(bundleName, (err, bundleData) => {
                if (err) {
                    console.log(err);
                    reject(null);
                    return;
                } else {
                    resolve(bundleData);
                    return;
                }
            });
        });
    }
}
