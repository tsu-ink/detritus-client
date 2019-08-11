import {
  Endpoints,
  RequestTypes,
} from 'detritus-client-rest';

import { ShardClient } from '../client';

import {
  BaseStructure,
  BaseStructureData,
} from './basestructure';
import { StoreListing } from './store';
import { User } from './user';


const keysGift: ReadonlyArray<string> = [
  'application_id',
  'code',
  'expires_at',
  'max_uses',
  'redeemed',
  'sku_id',
  'store_listing',
  'subscription_plan',
  'subscription_plan_id',
  'user',
  'uses',
];

const keysMergeGift: ReadonlyArray<string> = [
  'subscription_plan',
];

/**
 * Discord Nitro Gift Structure
 * @category Structure
 */
export class Gift extends BaseStructure {
  readonly _keys = keysGift;
  readonly _keysMerge = keysMergeGift;

  applicationId: string = '';
  code: string = '';
  expiresAt!: Date;
  maxUses: number = 0;
  redeemed: boolean = false;
  skuId: string = '';
  storeListing?: StoreListing;
  subscriptionPlan?: SubscriptionPlan;
  subscriptionPlanId: string = '';
  uses: number = 0;
  user!: User;

  constructor(client: ShardClient, data: BaseStructureData) {
    super(client);
    this.merge(data);
  }

  get longUrl(): string {
    return Endpoints.Gift.LONG(this.code);
  }

  get url(): string {
    return Endpoints.Gift.SHORT(this.code);
  }

  fetch(options: RequestTypes.FetchGiftCode) {
    return this.client.rest.fetchGiftCode(this.code, options);
  }

  redeem(options: RequestTypes.RedeemGiftCode) {
    return this.client.rest.redeemGiftCode(this.code, options);
  }

  mergeValue(key: string, value: any): void {
    if (value !== undefined) {
      switch (key) {
        case 'expires_at': {
          value = new Date(value);
        }; break;
        case 'store_listing': {
          value = new StoreListing(this.client, value);
        }; break;
        case 'subscription_plan': {
          value = new SubscriptionPlan(this.client, value);
          this.subscriptionPlanId = value.id;
        }; break;
        case 'user': {
          let user: User;
          if (this.client.users.has(value.id)) {
            user = <User> this.client.users.get(value.id);
            user.merge(value);
          } else {
            user = new User(this.client, value);
          }
          value = user;
        }; break;
      }
      return super.mergeValue.call(this, key, value);
    }
  }
}


const keysSubscriptionPlan = [
  'currency',
  'id',
  'interval',
  'interval_count',
  'name',
  'price',
  'sku_id',
  'tax_inclusive',
];

/**
 * Subscription Plan, used in [[Gift]]
 * @category Structure
 */
export class SubscriptionPlan extends BaseStructure {
  readonly _keys = keysSubscriptionPlan;

  currency: string = 'usd';
  id: string = '';
  interval: number = 0;
  intervalCount: number = 0;
  name: string = '';
  price: number = 0;
  skuId: string = '';
  taxInclusive: boolean = false;

  constructor(client: ShardClient, data: BaseStructureData) {
    super(client);
    this.merge(data);
  }
}
