import moment from "moment";
// import moment from "moment-timezone";

export const generateUniqueId = () => {
  const timestamp = new Date().getTime();

  // Generate a random number or string as a unique component
  const randomComponent = Math.random().toString(36).substring(2, 8);

  // Combine the timestamp and random component to create a unique ID
  const uniqueId = `${timestamp}-${randomComponent}`;
  return uniqueId;
};

// //If Current Time is greater than given time? // Output : true/false
export const isCurrentTimeGreaterThanGivenTime = (date: string | any) => {
  // Parse the given time using moment
  const givenMoment = moment(date);

  // Get the current moment
  const currentMoment = moment();

  // Get the Unix timestamps
  const givenUnixTimestamp = givenMoment.unix();
  const currentUnixTimestamp = currentMoment.unix();
  // Compare the timestamps
  return currentUnixTimestamp > givenUnixTimestamp;
};

// export const isCurrentTimeGreaterThanGivenTime = (date: string | any) => {
//   // Parse the given time using moment and set the timezone to America/New_York
//   const givenMoment = moment.tz(date, 'America/New_York');

//   // Set the timezone for the current moment to America/New_York
//   const currentMoment = moment().tz('America/New_York');

//   // Convert the given time to Indian timezone (Asia/Kolkata)
//   const givenMomentIndian = givenMoment.clone().tz('Asia/Kolkata');

//   // Get the Unix timestamps
//   const givenUnixTimestamp = givenMomentIndian.unix();
//   const currentUnixTimestamp = currentMoment.unix();

//   // Compare the timestamps
//   return currentUnixTimestamp > givenUnixTimestamp;
// };

// export const getMonthDayYearTimeValue = (date: string | any) => {
//   if(date){
//     return moment(date).local().format('MMMM DD, YYYY - hh:mm a');
//   }
// }

export const getMonthDayYearTimeValue = (date: string | any) => {
  if (date) {
    return moment(date).format("MMMM DD, YYYY - hh:mm a");
  }
};

// // For local test
export const getRecentTime = (date: string | any) => {
  // const currentTime: any = new Date();
  const messageTime: any = new Date(date);

  const isToday = (someDate: any) => {
    const today = new Date();
    return (
      someDate.getDate() === today.getDate() &&
      someDate.getMonth() === today.getMonth() &&
      someDate.getFullYear() === today.getFullYear()
    );
  };

  // const timeDiffSeconds = (currentTime - messageTime) / 1000;

  let formattedTime;

  // if (timeDiffSeconds < 60) {
  //   formattedTime = "a few seconds ago";
  // } else if (timeDiffSeconds >= 60 && timeDiffSeconds < 120) {
  //   formattedTime = "1 minute ago";
  // }
  if (isToday(messageTime)) {
    const hours = messageTime.getHours();
    const minutes = messageTime.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    const formattedHours = hours % 12 || 12;
    formattedTime = `Today, ${formattedHours}:${minutes
      .toString()
      .padStart(2, "0")}${ampm}`;
  } else {
    const day = messageTime.getDate().toString().padStart(2, "0");
    const month = messageTime.toLocaleString("default", { month: "short" });
    const year = messageTime.getFullYear().toString().slice(-2);
    const hours = messageTime.getHours();
    const minutes = messageTime.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    const formattedHours = hours % 12 || 12;
    formattedTime = `${day}-${month}-${year}, ${formattedHours}:${minutes
      .toString()
      .padStart(2, "0")}${ampm}`;
  }

  return formattedTime;
};

//For live server => live server time is 13h30mins advance
// export const getRecentTime = (date: string | any) => {
//   const messageTime: any = new Date(date);

//   // Offset for - 13h 30min
//   const offset = 13 * 60 * 60 * 1000 + 30 * 60 * 1000;

//   // Convert message time to Kolkata time
//   const kolkataTimestamp = new Date(messageTime.getTime() - offset);

//   const isToday = (someDate: any) => {
//     const today = new Date();
//     return (
//       someDate.getDate() === today.getDate() &&
//       someDate.getMonth() === today.getMonth() &&
//       someDate.getFullYear() === today.getFullYear()
//     );
//   };

//   let formattedTime;

//   if (isToday(kolkataTimestamp)) {
//     const hours = kolkataTimestamp.getHours();
//     const minutes = kolkataTimestamp.getMinutes();
//     const ampm = hours >= 12 ? "pm" : "am";
//     const formattedHours = hours % 12 || 12;
//     formattedTime = `Today, ${formattedHours}:${minutes
//       .toString()
//       .padStart(2, "0")}${ampm}`;
//   } else {
//     const day = kolkataTimestamp.getDate().toString().padStart(2, "0");
//     const month = kolkataTimestamp.toLocaleString("default", {
//       month: "short",
//     });
//     const year = kolkataTimestamp.getFullYear().toString().slice(-2);
//     const hours = kolkataTimestamp.getHours();
//     const minutes = kolkataTimestamp.getMinutes();
//     const ampm = hours >= 12 ? "pm" : "am";
//     const formattedHours = hours % 12 || 12;
//     formattedTime = `${day}-${month}-${year}, ${formattedHours}:${minutes
//       .toString()
//       .padStart(2, "0")}${ampm}`;
//   }

//   return formattedTime;
// };

// export const getMonthDayYearTimeValue = (date: string | any) => {
//   if(date) {
//     // Assuming that the input date is in American timezone
//     const americanDateTime = moment.tz(date, 'America/New_York');

//     // Convert the American timezone to Indian timezone
//     const indianDateTime = americanDateTime.clone().tz('Asia/Kolkata');

//     // Modify the logic as needed, e.g., use 'MMMM DD, YYYY - HH:mm' for 24-hour format
//     return indianDateTime.format('MMMM DD, YYYY - hh:mm a');
//   }
// }
