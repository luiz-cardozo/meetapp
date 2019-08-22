import * as Yup from 'yup';
import { Op } from 'sequelize';
import { isBefore, parseISO, startOfDay, endOfDay } from 'date-fns';
import Meetup from '../models/Meetup';
import User from '../models/User';

class MeetupController {
  async index(req, res) {
    const where = {};
    const page = req.query.page || 1;
    if (req.query.date) {
      const searchDate = parseISO(req.query.date);

      where.date = {
        [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
      };
    }

    const meetups = await Meetup.findAll({
      where,
      limit: 5,
      offset: (page - 1) * 5,
      include: [User],
    });
    return res.json(meetups);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      file_id: Yup.number(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    if (isBefore(parseISO(req.body.date), new Date())) {
      return res.status(400).json({ error: 'Meetup date invalid' });
    }

    const user_id = req.userId;

    const meetup = await Meetup.create({
      ...req.body,
      user_id,
    });

    return res.json(meetup);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      file_id: Yup.number(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
    });

    if (!schema.isValid(req.body)) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const meetup = await Meetup.findByPk(req.params.meetupId);
    const { userId } = req;

    if (meetup.user_id !== userId) {
      return res.status(401).json({
        error: "You can't update events that your're not the creator",
      });
    }

    if (meetup.past) {
      return res.status(400).json({ error: "You can't update past meetups" });
    }

    if (isBefore(req.body.date, new Date())) {
      return res.status(401).json({ error: "You can't alter to past dates" });
    }

    await meetup.update(req.body);

    return res.json(meetup);
  }

  async delete(req, res) {
    const meetup = await Meetup.findByPk(req.params.meetupId);
    if (req.userId !== meetup.user_id) {
      return res
        .status(400)
        .json({ error: "You don't have access to delete this meetup" });
    }

    if (isBefore(meetup.date, new Date())) {
      return res.status(401).json({ error: "You can't delete past events" });
    }

    await meetup.destroy();

    return res.send();
  }
}

export default new MeetupController();
