const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Women Care API',
    description: 'Auto-generated docs',
  },
  host: 'localhost:7000',
  schemes: ['http'],
  tags: [
    {
      name: '',
      description: 'Super Admin Routes'
    },
  
  ]

};

const outputFile = './swagger_output.json';
const endpointsFiles = ['./']; 

swaggerAutogen(outputFile, endpointsFiles, doc);