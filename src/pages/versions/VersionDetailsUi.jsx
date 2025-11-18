import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { CenteredBox } from "../../components/layouts/common/boxes";
import { unEscapeStr } from "../../utils/helper";

const VersionDetailsUi = ({ loading, list }) => {
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    const storedPdf = localStorage.getItem("pdfUrl");
    if (storedPdf) {
      setPdfUrl(storedPdf);
    } else if (list?.url) {
      setPdfUrl(list.url);
      console.log("object list", list.url);
    //   localStorage.setItem("pdfUrl", list.url);
    }
  }, [list?.url]);

  const viewerUrl = pdfUrl
    ? `https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}&embedded=true`
    : null;

  return (
    <Box>
      {loading && (
        <CenteredBox mt={4} mb={4}>
          <CircularProgress />
        </CenteredBox>
      )}

      {!loading && list && list["_id"] && (
        <Box>
          <Box mb={4}>
            <Typography fontWeight="bold" variant="body1">
              Version Name:
            </Typography>
            <Typography variant="body2" mt={1}>
              {list.name}
            </Typography>

            <Typography fontWeight="bold" variant="body1">
              Version Code:
            </Typography>
            <Typography variant="body2" mt={1}>
              {list.main_version}.{list.sub_version}
            </Typography>

            <Typography fontWeight="bold" variant="body1" mt={3}>
              What's New?:
            </Typography>
            <Box
              sx={{ background: "#f2f2f2" }}
              mt={2}
              p={2}
              dangerouslySetInnerHTML={{
                __html: unEscapeStr(list.description),
              }}
            />

            {list?.url && <Box display="flex" flexDirection="column" alignItems="center" mt={3}>
              <Box display="flex" flexDirection="row">
                <Typography fontWeight="bold" variant="body1">
                  Policy Name:
                </Typography>
                <Typography variant="h4" sx={{ ml: 2, fontWeight: "bold" }}>
                  {list?.policy_name}
                </Typography>
              </Box>

              <Box mt={3} width="100%" height="500px">
                {viewerUrl ? (
                  <iframe
                    title="PDF Preview"
                    src={viewerUrl}
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "none",
                    }}
                  />
                ) : (
                  <Typography variant="body2" color="error">
                    Unable to load the PDF file.
                  </Typography>
                )}
              </Box>
            </Box>}
          </Box>
        </Box>
      )}

    </Box>
  );
};

export default VersionDetailsUi;
