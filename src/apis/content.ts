import request from '../request';
import qs from 'query-string';
import { qwasm } from '~/utils/quorum-wasm/load-quorum';

export enum ContentTypeUrl {
  Object = 'quorum.pb.Object',
  Person = 'quorum.pb.Person',
}

export interface IPostContentResult {
  trx_id: string
}

export type IContentItem = INoteItem | ILikeItem | IPersonItem;

export interface IContentItemBasic {
  TrxId: string
  Publisher: string
  TypeUrl: string
  TimeStamp: number
}

export interface INoteItem extends IContentItemBasic {
  Content: INote
}

export interface ILikeItem extends IContentItemBasic {
  Content: ILike
}

export interface INote {
  type: 'Note'
  content: string
  id?: string
  name?: string
  image?: IImage[]
  inreplyto?: {
    trxid: string
  }
  attributedTo?: Array<Record<string, string>>
}

export interface ILike {
  type: LikeType
  id: string
}

export interface IImage {
  mediaType: string
  name: string
  content: string
}

export interface INotePayload {
  type: string
  object: INote
  target: {
    id: string
    type: string
  }
}

export enum LikeType {
  Like = 'Like',
  Dislike = 'Dislike',
}

export interface ILikePayload {
  type: LikeType
  object: {
    id: string
  }
  target: {
    id: string
    type: string
  }
}

export interface IPersonItem extends IContentItemBasic {
  Content: IPerson
}

export interface IPerson {
  name: string
  image?: {
    mediaType: string
    content: string
  }
  wallet?: Array<IWalletItem>
}

export interface IProfile {
  name: string
  avatar: string
  mixinUID?: string
}

export interface IProfilePayload {
  type: string
  person: IPerson
  target: {
    id: string
    type: string
  }
}

export interface IWalletItem {
  id: string
  type: string
  name: string
}

export const fetchContents = (
  groupId: string,
  options: {
    num: number
    starttrx?: string
    reverse?: boolean
  },
) => {
  if (!process.env.IS_ELECTRON) {
    return qwasm.GetContent(
      groupId,
      options.num,
      options.starttrx ?? '',
      options.reverse ?? false,
    ) as Promise<null | Array<IContentItem>>;
  }
  return request(
    `/app/api/v1/group/${groupId}/content?${qs.stringify(options)}`,
    {
      method: 'POST',
      quorum: true,
      body: { senders: [] },
      jwt: true,
    },
  ) as Promise<null | Array<IContentItem>>;
};

export const postNote = (content: INotePayload) => {
  if (!process.env.IS_ELECTRON) {
    return qwasm.PostToGroup(JSON.stringify(content)) as Promise<IPostContentResult>;
  }
  return request('/api/v1/group/content', {
    method: 'POST',
    quorum: true,
    body: content,
    jwt: true,
  }) as Promise<IPostContentResult>;
};

export const like = (likeContent: ILikePayload) => {
  if (!process.env.IS_ELECTRON) {
    return qwasm.PostToGroup(JSON.stringify(likeContent)) as Promise<IPostContentResult>;
  }
  return request('/api/v1/group/content', {
    method: 'POST',
    quorum: true,
    body: likeContent,
    jwt: true,
  }) as Promise<IPostContentResult>;
};

export const updateProfile = (profile: IProfilePayload) => {
  if (!process.env.IS_ELECTRON) {
    return qwasm.UpdateProfile(JSON.stringify(profile)) as Promise<IPostContentResult>;
  }
  return request('/api/v1/group/profile', {
    method: 'POST',
    quorum: true,
    body: profile,
    jwt: true,
  }) as Promise<IPostContentResult>;
};
