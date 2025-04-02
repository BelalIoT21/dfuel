import { isWeb } from '../../utils/platform';
import { mongoMachineService } from './machineService';
import mongoSeedService from './seedService';

class MongoConnectionService {
  private client: any | null = null;
  private db: any | null = null;
  private uri: string;
  private isConnecting: boolean = false;
  private connectionPromise: Promise<any | null> | null = null;
  private initialized: boolean = false;
  private connectionAttempts: number = 0;
  private maxConnectionAttempts: number = 3;
  
}

const mongoConnectionService = new MongoConnectionService();
export default mongoConnectionService;