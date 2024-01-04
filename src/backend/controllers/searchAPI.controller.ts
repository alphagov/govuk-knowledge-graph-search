import { RequestHandler } from 'express'
import {
  sendInitQuery,
  sendSearchQuery,
  getTaxonInfo,
} from '../bigquery/bigquery'

import { SearchParams } from '../../common/types/search-api-types'
import { getParams } from '../utils/getParams'
import { parsePhoneNumber } from '../../common/utils/utils'
import log from '../utils/logging'

class SearchAPIController {
  public getInitData: RequestHandler = async (req, res) => {
    try {
      const response = await sendInitQuery()
      res.send(response)
    } catch (e) {
      log.error({ error: e }, 'ERROR fetching init data')
      res.status(500).send(e)
    }
  }

  public searchApi: RequestHandler = async (req, res) => {
    const params: SearchParams = getParams(req)
    // Check that the phone number can be parsed, if given
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { phoneNumber, error } = parsePhoneNumber(params.phoneNumber)
    if (error) {
      const errorMessage = 'The phone number could not be parsed'
      log.error({ phoneNumber: params.phoneNumber }, errorMessage)
      res.status(400).send(errorMessage)
      return
    }
    try {
      const data = await sendSearchQuery(params)
      res.send(data)
    } catch (e: any) {
      log.error({ error: e }, 'ERROR fetching search data')
      res.status(500).send(e)
    }
  }

  public searchTaxon: RequestHandler = async (req, res) => {
    try {
      const data = await getTaxonInfo(req.query.name as string)
      res.send(data)
    } catch (e: any) {
      if (e.status === 404) {
        res.status(e.status).send(e.message)
      } else {
        log.error({ error: e }, 'ERROR fetching search taxon')
        res.status(500).send(e.message)
      }
    }
  }
}

export default SearchAPIController
