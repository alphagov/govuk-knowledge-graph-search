import { RequestHandler } from 'express'
import { ENV } from '../enums/environments'

class SearchController {
  public search: RequestHandler = (req, res, next) => {
    const isIntegrationEnv = process.env.NODE_ENV === ENV.DEVELOPMENT

    try {
      res.render('search.njk', {
        isIntegrationEnv,
      })
    } catch (e) {
      next(e)
    }
  }
}

export default SearchController