

export default function dateinSec(date) {

const dateInSecs = Math.floor(new Date(date).getTime() / 1000);

return dateInSecs;
}
