import { Endpoints } from 'detritus-client-rest';

import { ShardClient } from '../client';
import { BaseSet } from '../collections/baseset';
import {
  addQuery,
  getFormatFromHash,
  UrlQuery,
} from '../utils';

import {
  BaseStructure,
  BaseStructureData,
} from './basestructure';
import { Application } from './application';


const keysStore = new BaseSet<string>([
  'id',
  'sku',
  'summary',
  'thumbnail',
]);

/**
 * Store Listing Structure
 * Used for Store Channels ([ChannelGuildStore])
 * @category Structure
 */
export class StoreListing extends BaseStructure {
  readonly _keys = keysStore;

  id: string = '';
  sku!: Sku;
  summary: string = '';
  thumbnail!: StoreListingThumbnail;

  constructor(client: ShardClient, data: BaseStructureData) {
    super(client);
    this.merge(data);
  }

  mergeValue(key: string, value: any): void {
    if (value !== undefined) {
      switch (key) {
        case 'sku': {
          value = new Sku(this.client, value);
        }; break;
        case 'thumbnail': {
          value = new StoreListingThumbnail(this, value);
        }; break;
      }
      return super.mergeValue.call(this, key, value);
    }
  }
}


const keysStoreListingThumbnail = new BaseSet<string>([
  'height',
  'id',
  'mime_type',
  'size',
  'width',
]);

/**
 * Store Listing Thumbnail Structure, used in [StoreListing]
 * @category Structure
 */
export class StoreListingThumbnail extends BaseStructure {
  readonly _keys = keysStoreListingThumbnail;
  readonly storeListing: StoreListing;

  height: number = 0;
  id: string = '';
  mimeType: string = '';
  size: number = 0;
  width: number = 0;

  constructor(storeListing: StoreListing, data: BaseStructureData) {
    super(storeListing.client);
    this.storeListing = storeListing;
    this.merge(data);
    Object.defineProperty(this, 'storeListing', {enumerable: false, writable: false});
  }
}


const keysSku = new BaseSet<string>([
  'access_type',
  'application',
  'application_id',
  'dependent_sku_id',
  'features',
  'flags',
  'id',
  'manifest_labels',
  'name',
  'premium',
  'release_date',
  'show_age_gate',
  'slug',
  'type',
]);

/**
 * Sku Structure, used in [Gift] and [StoreListing]
 * @category Structure
 */
export class Sku extends BaseStructure {
  readonly _keys = keysSku;

  accessType: number = 0;
  application?: Application;
  applicationId: string = '';
  dependentSkuId: null | string = null;
  features: Array<string> = [];
  flags: number = 0;
  id: string = '';
  manifestLabels?: Array<any> | null;
  name: string = '';
  premium?: null;
  releaseDate?: null | string;
  showAgeGate: boolean = false;
  slug: string = '';
  type: number = 0;

  constructor(client: ShardClient, data: BaseStructureData) {
    super(client);
    this.merge(data);
  }

  mergeValue(key: string, value: any): void {
    if (value !== undefined) {
      switch (key) {
        case 'application_id': {
          if (!this.application) {
            if (this.client.applications.has(value)) {
              this.application = <Application> this.client.applications.get(value);
            }
          }
        }; break;
        case 'application': {
          let application: Application;
          if (this.client.applications.has(value.id)) {
            application = <Application> this.client.applications.get(value.id);
            application.merge(value);
          } else {
            application = new Application(this.client, value);
          }
          value = application;
        }; break;
      }
      return super.mergeValue.call(this, key, value);
    }
  }
}


export const keysStoreApplicationAsset = new BaseSet<string>([
  'application_id',
  'filename',
  'height',
  'id',
  'mime_type',
  'size',
  'width',
]);

export class StoreApplicationAsset extends BaseStructure {
  readonly _keys = keysStoreApplicationAsset;

  applicationId: string = '';
  filename: string = '';
  height: number = 0;
  id: string = '';
  mimeType: string = '';
  size: number = 0;
  width: string = '';

  constructor(client: ShardClient, data: BaseStructureData) {
    super(client);
    this.merge(data);
  }

  get url(): string {
    return this.urlFormat();
  }

  urlFormat(format?: null | string, query?: UrlQuery): string {
    format = getFormatFromHash(
      this.id,
      format,
      this.client.imageFormat,
    );
    if (this.mimeType.startsWith('video/')) {
      format = 'mp4';
    }
    return addQuery(
      Endpoints.CDN.URL + Endpoints.CDN.APP_ASSET_STORE(this.applicationId, this.id, format),
      query,
    );
  }

  async delete() {
    return this.client.rest.deleteStoreApplicationAsset(this.applicationId, this.id);
  }
}
