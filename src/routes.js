import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';
import OrganizerController from './app/controllers/OrganizerController';

import authMiddleware from './app/middlewares/auth';
import SubscriptionController from './app/controllers/SubscriptionController';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/session', SessionController.store);

routes.use(authMiddleware);
routes.put('/users', UserController.update);

routes.post('/files', upload.single('file'), FileController.store);

routes.get('/organizer', OrganizerController.index);

routes.post('/meetup', MeetupController.store);
routes.put('/meetup/:meetupId', MeetupController.update);
routes.delete('/meetup/:meetupId', MeetupController.delete);
routes.get('/meetup', MeetupController.index);

routes.post('/subscription/:meetupId', SubscriptionController.store);
routes.get('/subscription/', SubscriptionController.index);

export default routes;
