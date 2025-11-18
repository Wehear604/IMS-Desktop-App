

const ImageComponent = ({ src, alt,sx={}, ...props }) => {
    return <img src={src} alt={alt} style={sx} {...props} />
}
export default ImageComponent