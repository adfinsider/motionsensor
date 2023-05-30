
const dotenv = require('dotenv')
const fastify = require('fastify')({ logger: true })
const { query } = require('./lib/db')
const { convertBools } = require('./utils/boolToString')
const port = process.env.PORT || 3000;
const SENSOR_TYPE = {
  MOTION: 'Motion',
  MOTION_COMBO: 'MotionCombo',
}

function hmsToSecondsOnly(str) {
  var p = str.split(':'),
    s = 0, m = 1;

  while (p.length > 0) {
    s += m * parseInt(p.pop(), 10);
    m *= 60;
  }

  return s;
}

//  
fastify.get('/', async (request, reply) => {
  reply.send({ hello: 'world' })
});

//  
fastify.post('/sensor/motion/notification', async (request, reply) => {
  try {
    let body = request.body;
    if (body && body.macId && body.type && body.message) {
      let now = new Date().toISOString()
      const insertData = await query(
        "INSERT INTO motion_sensor_notifications(macid,type,message,date,ts) VALUES($1,$2, $3, $4,$5);",
        [body.macId, body.type, body.message, now, now],
      )

      reply.send("Data saved")
    }
    else {
      throw new Error('Invalid data')
    }
  } catch (error) {
    throw new Error('Error saving data');
  }
});

//  
fastify.post('/sensor/motion/register', async (request, reply) => {
  try {
    let body = request.body;
    if (body && body.macId && body.emails && body.emails.length > 0) {
      let now = new Date().toISOString()
      const getUserDevices = await query(
        "Select email from user_sensor where   macId=$1 and email  in($2);",
        [body.macId, body.emails.join(',')],
      );
      let existingUsersEmails = getUserDevices.rows.map(x => x.email);
      let newRecords = body.emails.filter(x => existingUsersEmails.indexOf(x) < 0);
      for (const item of newRecords) {
        await query(
          "INSERT INTO user_sensor(macid,email,type,isActive,createdAt,modifiedAt) VALUES($1, $2, $3, $4,$5,$6);",
          [body.macId, item, SENSOR_TYPE.MOTION_COMBO, true, now, now],
        )
      }


      //Create motion sensor settings
      let motion_settings = await query("Select 1 from motion_sensor_combo_settings where   macId=$1;", [body.macId]);
      if (motion_settings.rows.length === 0) {
        await query(`INSERT INTO 'motion_sensor_combo_settings'(
          macId,
          sensorName,
          noMotionIsDetectedEnabled,
          noMotionIsDetectedDuration,
          motionIsDetectedEnabled,
          motionIsDetectedDuration,
          notificationsViaEmailEnabled,
          notificationsViaWhatsappEnabled,
          timeZone,
          temperatureEnabled,
          temperatureMinValue,
          temperatureMaxValue,
          humidityEnabled,
          humidityMinValue,
          humidityMaxValue,
          indoorAirQualityEnabled,
          indoorAirQualityValue,
          createdAt,
          timeDelayBetweenAlerts
          )
          VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17);`,
          [body.macId, "Motion sensor", false, 120, false, 0, false, false, "(GMT-05:00) Eastern Time (USA & Canada)", false, 30, 90, false, 25, 50, false, 0, new Date(),15]);
      }
      reply.send("Data saved");
    }
    else {
      throw new Error('Invalid data')
    }
  } catch (error) {
    console.log(error);
    reply.send('Error saving data');
  }
});

fastify.post('/sensor/motion/ack/:macId', async (request, reply) => {
  try {
    var macId = request.params.macId;
    if (macId) {
      const getUserDevices = await query(
        "Update  motion_sensor_ack set hasChanges=false,ackUpdatedAt=$2 where   macId=$1;",
        [macId, new Date()],
      );
      reply.send("Data saved");
    }
    else {
      throw new Error('Invalid macId');
    }
  } catch (error) {
    throw new Error('Error saving data');
  }
});

fastify.get('/sensor/motion/hasSettingsChanged/:macId', async (request, reply) => {
  try {
    var macId = request.params.macId;
    let response = {};
    if (macId) {
      const getChanges = await query(
        "Select 1 from motion_sensor_ack where   macId=$1 and hasChanges=true;",
        [macId],
      );
      if (getChanges.rows.length) {
        const settings = await query(
          "select *from motion_sensor_combo_settings where macId=$1;",
          [macId],
        )
        if (settings.rows.length > 0) {
          response = settings.rows[0];
        }
      }

      reply.send(response);
    }
    else {
      throw new Error('Invalid macId');
    }
  } catch (error) {
    throw new Error('Error saving data');
  }
});

fastify.get('/sensor/motion/settings/:macId', async (request, reply) => {
  try {
    var macId = request.params.macId;
    if (macId) {
      const settings = await query(
        "select *from motion_sensor_combo_settings where macId=$1;",
        [macId],
      )
      if (settings.rows.length > 0) {
        let data = settings.rows[0];
        reply.send(convertBools(data));
      }
      else {
        reply.send({ error: `No settings found with macId: ${macId}` });
      }
    }
    else {
      reply.send({ rror: 'Invalid macid' });
    }
  } catch (error) {
    console.log(error);
    reply.send({ rror: 'Error occured in server' });
  }
});


// Run the server!
const start = async () => {
  try {
    // await client.connect((err => {
    //   if (err) {
    //       console.error('Connection issue:', err.stack)
    //       reconnectLoop = reconnectLoop + 1
    //       sleepInterval = 1000 * reconnectLoop
    //       console.log('Trying Reconnect2' + '. Sleep Timeout ' + sleepInterval)
    //       client.end()
    //       setTimeout(postgresDBConnect,sleepInterval)

    //   } else {
    //       console.log('Connected to DB') 
    //   }
    //   }));
    await fastify.listen({ port: port, host: '0.0.0.0' })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()


