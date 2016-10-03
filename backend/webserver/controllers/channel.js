'use strict';

/*eslint no-unused-vars: ["error", {"args": "after-used"}]*/

module.exports = function(dependencies, lib) {

  function getChannels(req, res) {
    lib.conversation.getChannels({}, (err, result) => {
      if (err) {
        return res.status(500).json({
          error: {
            code: 500,
            message: 'Server Error',
            details: err.message || 'Error while getting channels'
          }
        });
      }

      res.status(200).json(result);
    });
  }

  return {
    getChannels
  };
};