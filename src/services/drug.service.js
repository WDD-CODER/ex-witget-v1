import { drugServiceLocal } from './drug.service.local'
import { drugServiceRemote } from './drug.service.remote'

const isLocal = (process.env.VUE_APP_SERVICE_MODE === 'LOCAL')

const DrugService = isLocal ? drugServiceLocal : drugServiceRemote

if (!DrugService) {
    console.error('❌ [Switcher] Critical Error: Selected service is undefined!')
}

console.log(`🔌 [Service Switcher] Active Service: ${isLocal ? 'LOCAL' : 'REMOTE'}`)

export default DrugService