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
export const isCurrentTimeGreaterThanGivenTime = (date: string | any) =>{
  // Parse the given time using moment
  const givenMoment = moment(date);

  // Get the current moment
  const currentMoment = moment();

  // Get the Unix timestamps
  const givenUnixTimestamp = givenMoment.unix();
  const currentUnixTimestamp = currentMoment.unix();
  // Compare the timestamps
  return currentUnixTimestamp > givenUnixTimestamp;
}

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


export const getMonthDayYearTimeValue = (date: string | any) => {
  if(date){
    return moment(date).local().format('MMMM DD, YYYY - hh:mm a');
  }
}

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
