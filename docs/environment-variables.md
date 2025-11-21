# Setting Environment Variables in Convex

This application uses several environment variables to connect to external APIs. These need to be set in the Convex dashboard for the application to work properly.

## Required Environment Variables

- `OPENAI_API_KEY`: API key for OpenAI (required for the OpenAI model to work)
- `ANTHROPIC_API_KEY`: API key for Anthropic Claude (required for the Claude model to work)
- `GROK_API_KEY`: API key for Grok (required for the Grok model to work)

## Setting Environment Variables in Convex Dashboard

1. Go to the [Convex Dashboard](https://dashboard.convex.dev)
2. Select your project
3. Go to "Settings" > "Environment Variables"
4. Click "Add Variable"
5. Enter the name and value for each required API key
6. Click "Save"

Example:

```
Name: OPENAI_API_KEY
Value: sk-your-api-key-here
```

## Environment Variables in Development vs Production

You can set different values for the same environment variable in development and production deployments. This is useful if you have separate API keys for testing and production.

## More Information

For more information on environment variables in Convex, see the [official documentation](https://docs.convex.dev/production/environment-variables).
