package org.fiware.devguideapp.utils.bigdata.mapreduce.mappers;

import java.io.IOException;
import java.util.Iterator;
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
public class AttrValueEmitterJsonColumn extends Mapper<Object, Text, Text, Text> {
    
    @Override
    public void map(Object key, Text value, Context context) throws IOException, InterruptedException {
        try {
            JSONParser jsonParser = new JSONParser();
            JSONObject document = (JSONObject) jsonParser.parse(value.toString());
            /*
            context.write(new Text((String) document.get("attrName")),
                    new Text((String) document.get("attrValue")));
            */
            Iterator it = document.keySet().iterator();
            
            while (it.hasNext()) {
                String jsonKey = (String) it.next();
                
                if (jsonKey.equals("recvTime") || jsonKey.equals("fiware-servicepath")
                        || jsonKey.equals("entityId") || jsonKey.equals("entityType")
                        || jsonKey.contains("_md")) {
                    continue;
                } // if
                
                context.write(new Text(jsonKey), new Text((String) document.get(jsonKey)));
            } // while
        } catch (ParseException ex) {
            Logger.getLogger(AttrValueEmitterJsonColumn.class.getName()).log(Level.SEVERE, null, ex);
        } // try catch // try catch // try catch // try catch
    } // map
    
} // AttrValueEmitterJsonColumn
