package com.darshanpc.portfolio.lambda;

import com.amazonaws.serverless.exceptions.ContainerInitializationException;
import com.amazonaws.serverless.proxy.internal.LambdaContainerHandler;
import com.amazonaws.serverless.proxy.model.AwsProxyResponse;
import com.amazonaws.serverless.proxy.model.HttpApiV2ProxyRequest;
import com.amazonaws.serverless.proxy.spring.SpringBootLambdaContainerHandler;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestStreamHandler;
import com.darshanpc.portfolio.PortfolioApplication;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * AWS Lambda entry point: runs the same Spring Boot application behind an API
 * Gateway HTTP API (payload format 2.0).
 *
 * <p>The application starts once per Lambda instance, in the static initialiser.
 * With SnapStart that happens when a version is published, and later cold starts
 * restore the snapshot instead of starting Spring again.
 */
public class StreamLambdaHandler implements RequestStreamHandler {

    private static final SpringBootLambdaContainerHandler<HttpApiV2ProxyRequest, AwsProxyResponse> HANDLER;

    static {
        // Uploaded images and PDFs travel base64-encoded through API Gateway.
        LambdaContainerHandler.getContainerConfig()
                .addBinaryContentTypes("image/png", "image/jpeg", "image/webp", "application/pdf", "multipart/form-data");
        try {
            HANDLER = SpringBootLambdaContainerHandler.getHttpApiV2ProxyHandler(PortfolioApplication.class);
        } catch (ContainerInitializationException e) {
            throw new IllegalStateException("Could not start the portfolio backend", e);
        }
    }

    @Override
    public void handleRequest(InputStream input, OutputStream output, Context context) throws IOException {
        HANDLER.proxyStream(input, output, context);
    }
}
