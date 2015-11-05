package org.fiware.devguideapp.utils.bigdata.mapreduce;

import org.fiware.devguideapp.utils.bigdata.mapreduce.reducers.AttrValuesJoiner;
import org.fiware.devguideapp.utils.bigdata.mapreduce.mappers.AttrValueEmitter;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FileStatus;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.NullWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;

/**
 *
 * @author frb
 */
public final class AttrStatsGetter {
    
    private static Configuration conf;
    private static FileSystem fs;
    private static Path baseInputFolder;
    private static Path baseOutputFolder;
    
    /**
     * Constructor. It is private since utility classes should not have a pulbic or default constructor.
     */
    private AttrStatsGetter() {
    } // AttrStatsGetter
    
    /**
     * Main method.
     * @param args
     */
    public static void main(String[] args) {
        try {
            // Get the arguments
            baseInputFolder = new Path(args[0]);
            baseOutputFolder = new Path(args[1]);
            
            // Get a HDFS file system object
            conf = new Configuration();
            conf.set("fs.default.name", "hdfs://localhost:8020");
            fs = FileSystem.get(conf);

            // Iterate the input folder
            process(baseInputFolder);
        } catch (IOException ex) {
            Logger.getLogger(AttrStatsGetter.class.getName()).log(Level.SEVERE, null, ex);
        } // try catch // try catch // try catch // try catch
    } // main
    
    private static void process(Path baseInputFolderName) {
        try {
            FileStatus[] fileStatus = fs.listStatus(baseInputFolderName);
            
            for (FileStatus fileStat : fileStatus) {
                if (fileStat.isDir()) {
                    process(fileStat.getPath());
                } else {
                    analyze(baseInputFolderName);
                } // if else
            } // for
        } catch (IOException ex) {
            Logger.getLogger(AttrStatsGetter.class.getName()).log(Level.SEVERE, null, ex);
        } // try catch // try catch // try catch // try catch
    } // process
    
    private static boolean analyze(Path input) {
        try {
            Job job = Job.getInstance(conf, "mr-temperature");
            job.setNumReduceTasks(0);
            job.setJarByClass(AttrStatsGetter.class);
            job.setMapperClass(AttrValueEmitter.class);
            job.setReducerClass(AttrValuesJoiner.class);
            job.setMapOutputKeyClass(Text.class);
            job.setMapOutputValueClass(Text.class);
            job.setOutputKeyClass(NullWritable.class);
            job.setOutputValueClass(Text.class);
            FileInputFormat.addInputPath(job, input);
            FileOutputFormat.setOutputPath(job, new Path(baseOutputFolder.getName() + input.getName()));
            
            // run the MapReduce job
            return job.waitForCompletion(true);
        } catch (IOException | InterruptedException | ClassNotFoundException ex) {
            Logger.getLogger(AttrStatsGetter.class.getName()).log(Level.SEVERE, null, ex);
            return false;
        } // try catch // try catch
    } // analyze
    
} // AttrStatsGetter
