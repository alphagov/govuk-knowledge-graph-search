import App from './app'
import AuthRoutes from './routes/AuthRoutes'
import IndexRoutes from './routes/IndexRoutes'
import config from './config'
import Routes from './enums/routes'

const routesList: Routes[] = [new IndexRoutes()]
if (config.authEnabled) {
  routesList.push(new AuthRoutes())
}
const app = new App(routesList)

app.listen()
