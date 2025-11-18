import React, { useState, useRef } from 'react'

import ReactCrop, {
    centerCrop,
    makeAspectCrop,

} from 'react-image-crop'
import { canvasPreview } from './canvasPreview'
import { useDebounceEffect } from './useDebounceEffect'

import 'react-image-crop/dist/ReactCrop.css'
import { Box, Button } from '@mui/material'
import { callSnackBar } from '../../../store/actions/snackbarAction'
import { useDispatch } from 'react-redux'
import { SNACK_BAR_VARIETNS } from '../../../utils/constants'
import SubmitButton from '../../button/SubmitButton'

// This is to demonstate how to make and center a % aspect crop
// which is a bit trickier so we use some helper functions.
function centerAspectCrop(
    mediaWidth,
    mediaHeight,
    aspect,
) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    )
}

export default function ImageCropComponent({ src, fileName, onSubmit = () => { } }) {
    const dispatch = useDispatch()
    const previewCanvasRef = useRef(null)
    const imgRef = useRef(null)
    const hiddenAnchorRef = useRef(null)
    const blobUrlRef = useRef('')
    const [crop, setCrop] = useState()
    const [completedCrop, setCompletedCrop] = useState()
    const [scale, setScale] = useState(1)
    const [rotate, setRotate] = useState(0)
    const [aspect, setAspect] = useState(1)

    const [loading, setLoading] = useState(false)

    function onSubmitFun() {
        if (!previewCanvasRef.current) {
            // throw new Error('Crop canvas does not exist')
            dispatch(callSnackBar('Crop canvas does not exist', SNACK_BAR_VARIETNS.error))
            return true
        }
        setLoading(true)
        previewCanvasRef.current.toBlob((blob) => {
            if (!blob) {
                setLoading(false)
                throw new Error('Failed to create blob')

            }
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current)
            }
            blobUrlRef.current = URL.createObjectURL(blob)

            blob.lastModifiedDate = new Date();
            blob.name = fileName;


            onSubmit(blob)
            setLoading(false)
            // hiddenAnchorRef.current.href = blobUrlRef.current
            // hiddenAnchorRef.current.click()
        })
    }
    const onImageLoad = (e) => {
        if (aspect) {
            const { width, height } = e.currentTarget
            setCrop(centerAspectCrop(width, height, aspect))
        }
        centerAspectCrop()
    }
    useDebounceEffect(
        async () => {
            if (
                completedCrop?.width &&
                completedCrop?.height &&
                imgRef.current &&
                previewCanvasRef.current
            ) {
                // We use canvasPreview as it's much faster than imgPreview.
                canvasPreview(
                    imgRef.current,
                    previewCanvasRef.current,
                    completedCrop,
                    scale,
                    rotate,
                )
            }
        },
        100,
        [completedCrop, scale, rotate],
    )



    return (
        <>
            <Box sx={{ flex: 1, height: "100%", display: "flex", flexDirection: 'column', overflow: "hidden" }}>

                <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
                    <canvas
                        ref={previewCanvasRef}
                        style={{

                            display: "none",
                            objectFit: 'contain',
                            width: completedCrop?.width ?? 0,
                            height: completedCrop?.height ?? 0,
                        }}
                    />
                    <Box sx={{ width: '100%', height: "100%", display: "flex", justifyContent: "center" }}>
                        {!!src && (
                            <ReactCrop

                                style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                                crop={crop}
                                onChange={(_, percentCrop) => setCrop(percentCrop)}
                                onComplete={(c) => setCompletedCrop(c)}
                            // aspect={aspect}
                            >
                                <img
                                    ref={imgRef}
                                    alt="Crop me"
                                    src={src}
                                    style={{ height: "100%", width: "100%", objectFit: "contain" }}
                                    onLoad={onImageLoad}
                                />
                            </ReactCrop>
                        )}
                    </Box>
                </Box>
                <Box mt={2}>
                    <SubmitButton title={loading ? "Cropping Image..." : "Crop Image"} onClick={onSubmitFun} disabled={!completedCrop || loading} fullWidth variant='contained'>
                        Submit
                    </SubmitButton>
                </Box>
            </Box>

            {/* {!!completedCrop && (
        <>
          <div>
           
          </div>
          <div>
            <button onClick={onDownloadCropClick}>Download Crop</button>
            <a
              ref={hiddenAnchorRef}
              download
              style={{
                position: 'absolute',
                top: '-200vh',
                visibility: 'hidden',
              }}
            >
              Hidden download
            </a>
          </div>
        </>
      )} */}
        </>
    )
}
