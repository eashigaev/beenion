import { User } from '../user/types'
import { SingleDocRepo, DocParams } from '../../repositories/singleDoc/types'
import { accessDenied } from '../errors'
import * as events from './events'

export type Newsletter = {
  id: string
  title: string
  description: string
  editors: string[]
  categories: string[]
  stages: {
    minSimilarityRank: number
    minReviews: number
    reviewers: number
    threshold: number
  }[]
  maxSubscribers: number
  version: number
}

export const newsletterApi = (newsletterRepo: SingleDocRepo<Newsletter>) => ({
  async get(id: string) {
    const newsletter = await newsletterRepo.get(id)
    return newsletter
  },

  async create(user: User, params: DocParams<Newsletter>) {

    return newsletterRepo.create({
      from: user,
      payload: {
        ...params,
        editors: [user.userId]
      },
      type: events.NEWSLETTER_CREATED
    })
  },

  async update(user: User, params: DocParams<Newsletter>) {
    const newsletter = await newsletterRepo.get(params.id)

    if (!newsletter.editors.includes(user.userId)) {
      throw accessDenied()
    }

    return newsletterRepo.save({
      from: user,
      payload: params,
      type: events.NEWSLETTER_METADATA_UPDATED
    })
  },

  async del(user: User, newsletterId: string) {
    const newsletter = await newsletterRepo.get(newsletterId)

    if (!newsletter.editors.includes(user.userId)) {
      throw accessDenied()
    }

    return newsletterRepo.delete({
      from: user,
      payload: {
        id: newsletterId
      }, 
      type: events.NEWSLETTER_DELETED
    })  
  }
})