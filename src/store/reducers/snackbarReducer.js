import { actions } from "../../utils/constants";


const initialState = {
    message:"",
    id:0,
    variant:"success"

}
const snackBarReducer = (state = initialState, action) => {
    switch (action.type) {
        case actions.CALL_SNACKBAR_DATA: return { ...state,message: action.message, variant: action.variant,id:Math.random() };        
        default: return { ...state }
    }

}
export default snackBarReducer