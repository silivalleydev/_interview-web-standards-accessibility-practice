import { withStyles, Button } from "@material-ui/core";

const FocusableButton = withStyles({
    root: {
        '&:focus': {
            border: '2px solid blue'
        },
        wordBreak: 'keep-all'
    }
})(Button);

export default FocusableButton;