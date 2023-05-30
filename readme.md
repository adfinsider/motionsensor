CREATE TABLE 'motion_sensor' (
  macid SYMBOL capacity 256 CACHE,
  status INT,
  date DATE,
  ts TIMESTAMP,
  isMailSent BOOLEAN,
  mailSentRetry INT
) timestamp (ts) PARTITION BY MONTH;

CREATE TABLE 'motion_sensor_ack' (
  macId SYMBOL capacity 256 CACHE,
  hasChanges BOOLEAN,
  settingsUpdatedAt TIMESTAMP,
  ackUpdatedAt TIMESTAMP
);

CREATE TABLE 'motion_sensor_combo_settings' (
  macId SYMBOL capacity 256 CACHE,
  sensorName STRING,
  noMotionIsDetectedEnabled BOOLEAN,
  noMotionIsDetectedDuration STRING,
  motionIsDetectedEnabled BOOLEAN,
  motionIsDetectedDuration STRING,
  notificationsViaEmailEnabled BOOLEAN,
  notificationsViaWhatsappEnabled BOOLEAN,
  timeZone STRING,
  temperatureEnabled BOOLEAN,
  humidityEnabled BOOLEAN,
  indoorAirQualityEnabled BOOLEAN,
  indoorAirQualityValue FLOAT,
  createdAt TIMESTAMP,
  modifiedAt TIMESTAMP,
  humidityMinValue FLOAT,
  humidityMaxValue FLOAT,
  temperatureMinValue FLOAT,
  temperatureMaxValue FLOAT
);
CREATE TABLE 'motion_sensor_notifications' (
  macid SYMBOL capacity 256 CACHE,
  type STRING,
  message STRING,
  date DATE,
  ts TIMESTAMP,
  isMailSent BOOLEAN,
  mailSentRetry INT
) timestamp (ts) PARTITION BY MONTH;

CREATE TABLE 'motion_sensor_settings' (
  macId SYMBOL capacity 256 CACHE,
  sensorNameDescription STRING,
  sensorActive BOOLEAN,
  sensorActiveMode STRING,
  sensorActiveOnSun BOOLEAN,
  sensorActiveOnMon BOOLEAN,
  sensorActiveOnTue BOOLEAN,
  sensorActiveOnWed BOOLEAN,
  sensorActiveOnThu BOOLEAN,
  sensorActiveOnFry BOOLEAN,
  sensorActiveOnSat BOOLEAN,
  sensorActiveStartTime1 STRING,
  sensorActiveEndTime1 STRING,
  sensorActiveStartTime2 STRING,
  sensorActiveEndTime2 STRING,
  keepSensorActiveAllDayOnWeekDaysNotSelected BOOLEAN,
  notifyType STRING,
  notifyDelay STRING,
  sensorGroup STRING,
  sensitivity STRING,
  timeZone STRING,
  notificationsEmailPhoneEnabled BOOLEAN,
  notificationsEmailPhone STRING,
  notificationsDelayAlert INT,
  notificationsAlaramRest BOOLEAN,
  notificationsPowerOrWifiDown BOOLEAN,
  createdAt TIMESTAMP,
  modifiedAt TIMESTAMP,
  schedule2enabled BOOLEAN,
  schedule1enabled BOOLEAN,
  temperatureEnabled BOOLEAN,
  temperatureCondition STRING,
  temperatureValue FLOAT,
  humidityEnabled BOOLEAN,
  humidityCondition STRING,
  humidityValue FLOAT,
  indoorAirQualityEnabled BOOLEAN,
  indoorAirQualityCondition STRING,
  indoorAirQualityValue FLOAT
);

CREATE TABLE 'user_sensor' (
  macId SYMBOL capacity 256 CACHE index capacity 256,
  email SYMBOL capacity 256 CACHE index capacity 256,
  type SYMBOL capacity 256 CACHE index capacity 256,
  isActive BOOLEAN,
  createdAt TIMESTAMP,
  modifiedAt TIMESTAMP
);

 sudo kubectl create secret docker-registry regcred --docker-server=registry.your_domain --docker-username=your_username --docker-password=your_password

 "# Springboot" 
