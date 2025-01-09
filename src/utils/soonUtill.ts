export const getDateTimeToDateString = (date) => {
    if (date) {
        const split = date?.split('T')
        if (split.length > 1) {
            const time = split[1]
            const date = split[0].replace('-', '.').replace('-', '.')
            const splitTime = time.split(':');
            if (splitTime.length > 1) {
                // '2023-10-01 22:22'

                return date + ' ' + splitTime[0] + ':' + splitTime[1]
            } else return ''

        }
    } else return ''
}

export const formatNumberWithComma = (input) => {
    const formattedNumber = input.replace(/\D/g, '');
    return formattedNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  export const formatDaysOfWeek = (daysOfWeek = []) => {

    const daysMap = {
      "월": "월",
      "화": "화",
      "수": "수",
      "목": "목",
      "금": "금",
      "토": "토",
      "일": "일"
    };
  
    let result = ''
    Object.keys(daysMap).forEach((dayMap, idx) => {
      let insert = false
      if (!result && daysOfWeek.includes(dayMap) && idx <= Object.keys(daysMap).length - 1) {
        result += daysMap[dayMap]
        insert = true
      }
      if (!insert && !!result && daysOfWeek.includes(dayMap) && idx !== Object.keys(dayMap).length - 1 && idx < Object.keys(daysMap).length - 1 && daysOfWeek.includes(Object.keys(daysMap)[idx + 1]) && daysOfWeek.includes(Object.keys(daysMap)[idx - 1])) {
        result += (result.charAt(result.length - 1) !== '~' ? '~' : '')
        insert = true
      }
      if (!insert && !!result && daysOfWeek.includes(dayMap) && idx !== Object.keys(dayMap).length - 1 && idx < Object.keys(daysMap).length - 1 && daysOfWeek.includes(Object.keys(daysMap)[idx + 1]) && !daysOfWeek.includes(Object.keys(daysMap)[idx - 1])) {
        result += ',' + daysMap[dayMap] + '~'
        insert = true
      }
      if (!insert && !!result && daysOfWeek.includes(dayMap) && idx !== Object.keys(dayMap).length - 1 && idx < Object.keys(daysMap).length - 1 && !daysOfWeek.includes(Object.keys(daysMap)[idx + 1]) && daysOfWeek.includes(Object.keys(daysMap)[idx - 1])) {
        result += (result.charAt(result.length - 1) !== '~' ? '~' : '') + daysMap[dayMap]
        insert = true
      }
      if (!insert && !!result && daysOfWeek.includes(dayMap) && idx !== Object.keys(dayMap).length - 1 && idx < Object.keys(daysMap).length - 1 && !daysOfWeek.includes(Object.keys(daysMap)[idx + 1]) && !daysOfWeek.includes(Object.keys(daysMap)[idx - 1])) {
        result += ',' + daysMap[dayMap]
        insert = true
      }
      if (!insert && !!result && daysOfWeek.includes(dayMap) && idx !== Object.keys(dayMap).length - 1 && idx < Object.keys(daysMap).length - 1 && !daysOfWeek.includes(Object.keys(daysMap)[idx + 1]) && daysOfWeek.includes(Object.keys(daysMap)[idx - 1])) {
        result += daysMap[dayMap]
        insert = true
      }
      if (!insert && !!result && idx === Object.keys(daysMap).length - 1 && daysOfWeek.includes(Object.keys(daysMap)[idx])) {
        result += (result.charAt(result.length - 1) !== '~' ? ',' : '') + daysMap[dayMap]
      }
      if (!insert && !result && idx === Object.keys(daysMap).length - 1 && daysOfWeek.includes(Object.keys(daysMap)[idx])) {
        result += daysMap[dayMap]
      }
    })
  
  
    return result;
  }


export function setTokenCookie(key = 'token', tokenValue, time = 480) {
  var d = new Date();
  d.setTime(d.getTime() + (time * 60 * 1000)); 
  var expires = "expires=" + d.toUTCString();
  document.cookie = key + "=" + tokenValue + ";" + expires + ";path=/";
}

export function getTokenFromCookie(key = 'token') {
  var name = key + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var cookieArray = decodedCookie.split(';');
  for(var i = 0; i < cookieArray.length; i++) {
      var cookie = cookieArray[i];
      while (cookie.charAt(0) == ' ') {
          cookie = cookie.substring(1);
      }
      if (cookie.indexOf(name) == 0) {
          return cookie.substring(name.length, cookie.length);
      }
  }
  return "";
}

export function deleteCookie(key = 'token') {
  var expires = "expires=Thu, 01 Jan 1970 00:00:00 UTC";
  document.cookie = key + "=; " + expires + "; path=/;";
}