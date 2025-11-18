import { Dialog, Zoom } from '@mui/material';
import { forwardRef, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { closeModal } from '../store/actions/modalAction'

const Transition = forwardRef(function Transition(props, ref) {
    return <Zoom closeAfterTransition ref={ref} {...props} />;
});

const PopUpModal = () => {

    const modal = useSelector(state => state.modal)
    const dispatch = useDispatch()

    return <>
        {
            modal && Array.from(modal).map((item) => {
                const [key, modalItem] = item
                return <Dialog
                    key={modalItem.id}
                    fullWidth={true}
                    TransitionComponent={Transition}
                    maxWidth={modalItem.size}
                    closeAfterTransition
                    componentsProps={{ closeAfterTransition: true }}
                    open={modalItem.open}
                    onClose={() => { if (!modalItem.disableDirectClose) { dispatch(closeModal(modalItem.id)) } }}
                >
                    {modalItem.component}
                </Dialog>
            })
        }
    </>
}
export default memo(PopUpModal)