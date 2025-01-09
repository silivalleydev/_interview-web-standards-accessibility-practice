
export default {
    getIsToday: createdAt => false,
    tellDeveloper: () => alert('개발팀에게 문의하이소'),
    numberWithCommas: x => x?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
};





export const formatDateString = (dateString) => {
    const originalDate = new Date(dateString);

    const year = originalDate.getFullYear();
    const month = String(originalDate.getMonth() + 1).padStart(2, '0');
    const day = String(originalDate.getDate()).padStart(2, '0');
    const hours = String(originalDate.getHours()).padStart(2, '0');
    const minutes = String(originalDate.getMinutes()).padStart(2, '0');
    const seconds = String(originalDate.getSeconds()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return formattedDate;
};


// 오늘 날짜
// diffType -> year | month | day
export const getFormattedDate = (date = new Date(), diffType, diff = 0) => {
    if (diffType === 'month') {
        date.setMonth(date.getMonth() + diff);
    }

    if (diffType === 'day') {
        date.setDate(date.getDate() - diff);

    }
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};