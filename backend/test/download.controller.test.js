import chai from 'chai';
import td from 'testdouble';
import { DownloadService } from '../services/download.service';
import { DownloadController } from '../controllers/download.controller';

describe('DownloadController', () => {

    it('should instantiate the service', () => {
        let service = new DownloadService({});
        let controller = new DownloadController(service);
        chai.assert.deepEqual(controller.service, service);
    });

    // todo add more controller tests
})