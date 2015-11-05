package org.fiware.devguideapp.utils.bigdata.mapreduce.mappers;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

/**
 *
 * @author Francisco Romero francisco.romerobueno@telefonica.com
 */
public class AttrValueEmitter extends Mapper<Object, Text, Text, Text> {
    
    @Override
    public void map(Object key, Text value, Context context) throws IOException, InterruptedException {
        try {
            JSONParser jsonParser = new JSONParser();
            JSONObject document = (JSONObject) jsonParser.parse(value.toString());
            context.write(new Text((String) document.get("attrName")),
                    new Text((String) document.get("attrValue")));
        } catch (ParseException ex) {
            Logger.getLogger(AttrValueEmitter.class.getName()).log(Level.SEVERE, null, ex);
        } // try catch // try catch
    } // map
    
} // AttrValueEmitter
