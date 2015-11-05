package org.fiware.devguideapp.utils.bigdata.mapreduce.reducers;

import java.io.IOException;
import org.apache.hadoop.io.NullWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;

/**
 *
 * @author Francisco Romero francisco.romerobueno@telefonica.com
 */
public class AttrValuesJoiner extends Reducer<Text, Text, NullWritable, Text> {
    
    @Override
    public void reduce(Text key, Iterable<Text> attrValues, Context context) throws IOException, InterruptedException {
        float max = Float.MIN_VALUE;
        float min = Float.MAX_VALUE;
        float sum = 0;
        float sum2 = 0;
        int n = 0;
        
        for (Text attrValue : attrValues) {
            float v = new Float(attrValue.toString());
            
            if (v > max) {
                max = v;
            } // if
            
            if (v < min) {
                min = v;
            } // if
            
            sum += v;
            sum2 += (v * v);
            n++;
        } // for
        
        Text output = new Text(max + " " + min + " " + (sum / n) + " " + ((sum2 / n) - ((sum / n) * (sum / n))));
        context.write(NullWritable.get(), output);
    } // reduce
    
} // AttrValuesJoiner
