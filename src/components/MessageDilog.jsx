
import { useDispatch } from 'react-redux'
import { closeModal } from "../store/actions/modalAction"
import CustomDialog from "./layouts/common/CustomDialog"

const MessageDilog = ({ title = "Error", message, onSubmit, loading, confirmText, modalId = 'error' }) => {
    const dispatch = useDispatch()
    const handleClose = () => {
        dispatch(closeModal())
    }
    return (
        <>
            <CustomDialog
                id={modalId}
                loading={loading}
                onClose={handleClose}
                onSubmit={onSubmit ? onSubmit : handleClose}
                title={title}
                closeText="Close"
                confirmText={confirmText ?? `okay`}
            >

                {message}
            </CustomDialog>


        </>
    )
}
export default MessageDilog