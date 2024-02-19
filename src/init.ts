import moment from 'moment';
import handlebars from 'handlebars';
import { config } from 'dotenv';
import error from './utils/error';

config();

handlebars.registerHelper('log', function (something) {
    console.log(something);
});

handlebars.registerHelper('dateFormat', function (format, value) {
    const timestamp = typeof value === 'string' ? Date.parse(value) : Date.now();
    if (isNaN(timestamp)) error(`Invalid date: ${value}`);
    return moment(timestamp).format(format);
});
