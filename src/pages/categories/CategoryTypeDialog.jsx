import { Dialog, Zoom } from '@mui/material';
import React, { forwardRef } from 'react'
import DepartmentCreateController from './DepartmentCreateController';

function CategoryTypeDialog({openProp, handleAreaModalClose}) {

    const Transition = forwardRef(function Transition(props, ref) {
        return <Zoom direction="in" ref={ref} {...props} />;
    });

  return (
    <Dialog

        fullWidth={true}
        TransitionComponent={Transition}
        maxWidth={'sm'}
        open={openProp}
        onClose={handleAreaModalClose}
    >
        <DepartmentCreateController handleAreaModalClose={handleAreaModalClose} isModal={true}/>
    </Dialog>
  )
}

export default CategoryTypeDialog