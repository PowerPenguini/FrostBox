export function formatDate(jsonDate) {
    const dateObject = new Date(jsonDate);
  
    const day = String(dateObject.getDate()).padStart(2, "0");
    const month = String(dateObject.getMonth() + 1).padStart(2, "0");
    const year = dateObject.getFullYear();
  
    return `${day}.${month}.${year}`;
  }
  