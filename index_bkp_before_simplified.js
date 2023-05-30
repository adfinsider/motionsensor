
const dotenv = require('dotenv')
const fastify = require('fastify')({ logger: true })
const { query } = require('./lib/db')
const { convertBools } = require('./utils/boolToString')
const port = process.env.PORT || 3000;
const SENSOR_TYPE = {
  MOTION: 'Motion',
}


// Declare a route
fastify.get('/', async (request, reply) => {
  reply.send({ hello: 'world' })
});

// Declare a route
fastify.post('/sensor/motion', async (request, reply) => {
  try {
    let body = request.body;
    if (body && body.macId && body.status) {
      let now = new Date().toISOString()
      const insertData = await query(
        "INSERT INTO motion_sensor(macid,status,date,ts) VALUES($1, $2, $3, $4);",
        [body.macId, parseInt(body.status), now, now],
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

// Declare a route
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
          [body.macId, item, SENSOR_TYPE.MOTION, true, now, now],
        )
      }


      //Create motion sensor settings
      let motion_settings = await query("Select 1 from motion_sensor_settings where   macId=$1;", [body.macId],);
      if (motion_settings.rows.length === 0) {
        await query(`INSERT INTO 'motion_sensor_settings'(macId,sensorNameDescription,sensorActive,sensorActiveMode,sensorActiveOnSun,sensorActiveOnMon,sensorActiveOnTue,sensorActiveOnWed,sensorActiveOnThu,sensorActiveOnFry,sensorActiveOnSat,sensorActiveStartTime1,sensorActiveEndTime1,sensorActiveStartTime2,sensorActiveEndTime2,keepSensorActiveAllDayOnWeekDaysNotSelected,notifyType,notifyDelay,sensorGroup,sensitivity,timeZone,notificationsEmailPhoneEnabled,notificationsEmailPhone,notificationsDelayAlert,notificationsAlaramRest,notificationsPowerOrWifiDown,createdAt,modifiedAt)
        VALUES($1,'Motion Sensor',true,'Always',false,false,false,false,false,false,false,'00:00','00:00','00:00','00:00',false,'MotionIsDetected','00:00','','High','(GMT-05:00) Eastern Time (USA & Canada)',
        true,$2,15,false,false,systimestamp(),systimestamp());`,
          [body.macId, body.emails.join(',')]);
      }
      
      reply.send("Data saved");
    }
    else {
      throw new Error('Invalid data')
    }
  } catch (error) {
    throw new Error('Error saving data');
  }
});

fastify.post('/sensor/motion/ack/:macId', async (request, reply) => {
  try {
    var macId = request.params.macId;
    if (macId) {
      const getUserDevices = await query(
        "Update  motion_sensor_ack set hasChanges=false where   macId=$1;",
        [macId],
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
    if (macId) {
      const getChanges = await query(
        "Select 1 from motion_sensor_ack where   macId=$1 and hasChanges=true;",
        [macId],
      );
      reply.send((getChanges.rows.length >0).toString());
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
        "select *from motion_sensor_settings where macId=$1;",
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


