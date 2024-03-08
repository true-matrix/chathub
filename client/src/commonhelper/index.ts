// import ShortUniqueId from "short-unique-id";

// export const generateUniqueId = () => {
//     const uid = new ShortUniqueId({
//         dictionary: "hex",
//       });
//       const timestamp = new Date();
//       const result = uid.formattedUUID("$t0-$s2-$r4", timestamp);
//       return result;
//   };


export const generateUniqueId = () => {
    const timestamp = new Date().getTime();

    // Generate a random number or string as a unique component
    const randomComponent = Math.random().toString(36).substring(2, 8);
  
    // Combine the timestamp and random component to create a unique ID
    const uniqueId = `${timestamp}-${randomComponent}`;
  return uniqueId;
};
