import TableCell from "@material-ui/core/TableCell";
import { withStyles } from '@material-ui/core/styles';

const NoBorderTableCell = withStyles({
  root: {
    borderBottom: "none",
    color: '#3f51b5'
  }
})(TableCell);

export default NoBorderTableCell;